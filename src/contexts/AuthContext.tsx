import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
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
          try {
            await setDoc(userRef, {
              ...newUserData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setUserData(newUserData);
          } catch (e) {
            console.error("Error creating user document", e);
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Opcional: provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Erro no login com o Google:", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Erro: O domínio da sua Vercel não está autorizado no Firebase. Vá no Console do Firebase > Authentication > Settings (Configurações) > Authorized domains (Domínios Autorizados) e adicione o seu domínio da Vercel.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("O seu navegador bloqueou o popup de login. Por favor, permita popups para este site.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // Usuário fechou o popup intencionalmente, nada a fazer
      } else {
        alert("Ocorreu um erro ao tentar fazer login: " + error.message);
      }
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
    <AuthContext.Provider value={{ user, userData, loading, loginWithGoogle, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
