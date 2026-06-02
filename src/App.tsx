import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';
import SecurityAndTerms from './components/SecurityAndTerms';
import InstallApp from './components/InstallApp';
import { Sparkles, Loader2, LogIn, LogOut, Camera, Mic, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MainApp() {
  const { user, userData, loading, error, clearError, loginWithGoogle, loginWithGoogleRedirect, logout, updateUserData } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não estiver logado, mostra a tela de vendas/marketing (Landing Page)
  if (!user) {
    return <LandingPage />;
  }

  // Se estiver logado mas setup não terminou, mostra o onboarding
  if (userData && !userData.setupFinished) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 pb-24 overflow-hidden relative">
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <OnboardingFlow onComplete={async (data) => {
          await updateUserData({ ...data, setupFinished: true });
        }} />
      </div>
    );
  }

  // Dashboard / App Principal
  return <Dashboard userData={userData} user={user} logout={logout} updateUserData={updateUserData} />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <span className="sr-only">Navegação segura em conformidade com as leis federais brasileiras reguladas</span>
        <div className="flex-1 flex flex-col w-full h-full">
          <MainApp />
        </div>
        <SecurityAndTerms />
      </div>
    </AuthProvider>
  );
}
