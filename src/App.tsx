import { AuthProvider, useAuth } from './contexts/AuthContext';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';
import { Sparkles, Loader2, LogIn, LogOut, Camera, Mic, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MainApp() {
  const { user, userData, loading, loginWithGoogle, logout, updateUserData } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não estiver logado, mostra a tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 sm:p-24 overflow-hidden relative">
        <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="z-10 text-center max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary shadow-xl border border-border">
               <Sparkles size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-foreground">Simplifica.</h1>
          <p className="text-muted-foreground mb-8 text-lg">Pare de perder dinheiro por falta de organização no seu negócio.</p>
          
          <Button onClick={loginWithGoogle} size="lg" className="w-full h-14 text-lg font-medium shadow-primary/20 shadow-lg">
            <LogIn className="mr-2 w-5 h-5" /> Entrar com Google
          </Button>
        </div>
      </div>
    );
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
      <MainApp />
    </AuthProvider>
  );
}
