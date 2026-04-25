import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserData {
  uid: string;
  name: string;
  email: string;
  setupFinished: boolean;
  businessName?: string;
  segment?: string;
  dailyGoal?: number;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGoogleRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se voltou de um redirect de login
    getRedirectResult(auth).catch((err: any) => {
      console.error("Erro no redirecionamento do Google:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("O domínio deste aplicativo não está autorizado no Firebase. Adicione-o na aba Authentication do Firebase.");
      } else {
        setError("Erro após redirecionamento: " + err.message);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            const newUserData: UserData = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              setupFinished: false,
            };
            await setDoc(userRef, {
              ...newUserData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setUserData(newUserData);
          }
        } catch (e: any) {
          console.error("Error fetching/creating user document", e);
          if (e.message?.includes('permissions')) {
             setError("Erro de permissão no banco de dados. Verifique as regras do Firestore.");
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Opcional: provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Erro no login com o Google:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("O domínio deste aplicativo não está autorizado no Firebase. Adicione-o na aba Authentication do Firebase.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("O popup de login foi bloqueado. Tente por outro navegador ou permita popups.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        // Usuário fechou o popup intencionalmente, nada a fazer
      } else {
        setError("Erro ao fazer login: " + err.message);
      }
    }
  };

  const loginWithGoogleRedirect = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error("Erro no login com redirect:", err);
      setError("Erro ao fazer login via redirecionamento: " + err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (e) {
      console.error("Error updating user document", e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, error, clearError, loginWithGoogle, loginWithGoogleRedirect, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
