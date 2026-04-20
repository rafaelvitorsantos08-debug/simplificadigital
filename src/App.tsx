import { AuthProvider, useAuth } from './contexts/AuthContext';
import OnboardingFlow from './components/OnboardingFlow';
import { Sparkles, Loader2, LogIn, LogOut, Camera, Mic, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from './components/ui/button';

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

  // Dashboard / App Principal ("Vibrant Palette" com Flex/Grid Layout e estilização baseada no Design HTML)
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto h-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 w-full">
        <div className="text-2xl font-extrabold tracking-tight">
          SIMPLIFICA<span className="text-primary">DIGITAL</span>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-full border border-white/5 shadow-sm">
          <div className="w-6 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
          <span className="font-medium text-sm">{userData?.businessName || user.displayName}</span>
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-full w-8 h-8 ml-2 hover:bg-destructive/20 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Status Panel (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 flex-1 w-full relative">
        
        {/* Main Card */}
        <div className="bg-card rounded-[32px] p-8 sm:p-10 relative border-l-[8px] border-primary flex flex-col shadow-lg">
          <div className="text-[14px] uppercase tracking-[2px] text-muted-foreground mb-4 font-medium">Saúde do Negócio</div>
          <div className="text-6xl sm:text-7xl lg:text-[84px] font-bold tracking-tight mb-4 text-foreground leading-none">R$ 0,00</div>
          
          <div className="flex items-center text-primary text-lg font-medium mb-8">
             <TrendingUp className="w-5 h-5 mr-2" />
             Meta Mensal: R$ {userData?.dailyGoal ? (userData.dailyGoal * 30).toFixed(2) : '0.00'}
          </div>
          
          {/* Semaphore Lights */}
          <div className="flex gap-4 mt-auto">
            <div className="w-12 h-12 rounded-full bg-primary opacity-100 shadow-[0_0_20px_var(--color-primary)]"></div>
            <div className="w-12 h-12 rounded-full bg-[#FFB800] opacity-20"></div>
            <div className="w-12 h-12 rounded-full bg-destructive opacity-20"></div>
          </div>
          <div className="mt-8 text-xl text-muted-foreground max-w-md">
            Você atingiu 0% da sua meta. Lance as vendas para iniciar!
          </div>
        </div>
        
        {/* Info Grid */}
        <div className="grid grid-rows-2 gap-6">
          {/* Sub card 1 */}
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col justify-center shadow-lg">
            <div className="text-[14px] uppercase tracking-[2px] text-muted-foreground mb-2 font-medium">Estoque Crítico</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-3xl font-semibold">0 Itens</span>
              <span className="text-primary font-medium">Tudo Normal</span>
            </div>
            <div className="text-[12px] opacity-60 mt-1">Seu estoque está abastecido.</div>
          </div>
          
          {/* Sub card 2 */}
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col justify-center shadow-lg">
            <div className="text-[14px] uppercase tracking-[2px] text-muted-foreground mb-2 font-medium">Pendências WhatsApp</div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-3xl font-semibold">0 Clientes</span>
              <span className="text-[#FFB800] font-medium opacity-80">Zeradinho</span>
            </div>
            <div className="text-[12px] opacity-60 mt-1">Clique para gerar links de pagamento</div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 w-full mt-10 mb-4 z-10">
        <button className="flex-1 h-[120px] rounded-[24px] bg-primary text-black flex flex-col items-center justify-center gap-3 font-semibold text-[18px] cursor-pointer transition-transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,255,102,0.2)]">
          <div className="w-[32px] h-[32px] border-[3px] border-black rounded-lg flex items-center justify-center relative"><Camera size={18} strokeWidth={3} /></div>
          Lançar Venda (Foto)
        </button>
        <button className="flex-1 h-[120px] rounded-[24px] bg-secondary text-primary border border-primary/20 flex flex-col items-center justify-center gap-3 font-semibold text-[18px] cursor-pointer transition-transform hover:scale-[1.02] shadow-sm">
          <div className="w-[32px] h-[32px] border-[3px] border-primary rounded-full flex items-center justify-center"><Mic size={18} strokeWidth={3} /></div>
          Registrar por Áudio
        </button>
        <button className="flex-1 h-[120px] rounded-[24px] bg-secondary text-primary border border-primary/20 flex flex-col items-center justify-center gap-3 font-semibold text-[18px] cursor-pointer transition-transform hover:scale-[1.02] shadow-sm">
          <div className="w-[32px] h-[32px] border-[3px] border-primary rounded-lg flex items-center justify-center"><BarChart3 size={18} strokeWidth={3} /></div>
          Ver Relatórios
        </button>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
