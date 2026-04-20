import { useState } from 'react';
import { Camera, Mic, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

export default function Dashboard({ userData, user, logout }: any) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Aqui ficará o overlay para gravação de áudio ou captura de foto.
  if (activeAction === 'audio') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center justify-center">
         <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] mb-8 border-4 border-primary shadow-[0_0_30px_rgba(0,255,102,0.5)]">
            <Mic className="text-primary w-12 h-12" />
         </div>
         <h2 className="text-2xl font-bold mb-2">Escutando gravação...</h2>
         <p className="text-muted-foreground mb-8 text-center max-w-md">Pode falar, ex: "Vendi uma camiseta básica por 50 reais no PIX"</p>
         
         <div className="flex gap-4">
           <Button variant="outline" size="lg" onClick={() => setActiveAction(null)}>Cancelar</Button>
           <Button size="lg" className="px-8 shadow-[0_0_15px_rgba(0,255,102,0.4)]">Terminar e Analisar</Button>
         </div>
      </div>
    );
  }

  if (activeAction === 'photo') {
     return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center justify-center">
         <div className="w-full max-w-md h-64 bg-secondary border border-border rounded-[24px] flex items-center justify-center mb-8 flex-col gap-4 text-muted-foreground">
            <Camera className="w-12 h-12" />
            <span>(Abriremos a câmera do dispositivo aqui)</span>
         </div>
         
         <div className="flex gap-4">
           <Button variant="outline" size="lg" onClick={() => setActiveAction(null)}>Voltar</Button>
           <Button size="lg" className="px-8 shadow-[0_0_15px_rgba(0,255,102,0.4)]">Tirar Foto do Recibo</Button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto h-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 w-full animate-fade-in">
        <div className="text-2xl font-extrabold tracking-tight">
          SIMPLIFICA<span className="text-primary">DIGITAL</span>
        </div>
        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-full border border-border/40 shadow-sm backdrop-blur-sm">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(0,255,102,0.8)]"></div>
          <span className="font-medium text-xs sm:text-sm text-foreground/80 max-w-[100px] sm:max-w-none truncate">{userData?.businessName || user.displayName}</span>
          <button onClick={logout} className="text-xs text-destructive hover:underline ml-2 hidden sm:block">Sair</button>
        </div>
      </header>

      {/* Status Panel (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 flex-1 w-full relative">
        
        {/* Main Card */}
        <div className="bg-card rounded-[32px] p-8 sm:p-10 relative border-l-[6px] sm:border-l-[8px] border-primary flex flex-col shadow-xl">
          <div className="text-xs sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-4 font-medium flex justify-between items-center w-full">
             <span>Vendas Hoje</span>
             <span className="text-primary/60 bg-primary/10 px-2 py-1 rounded-md text-[10px] tracking-normal border border-primary/20">Ao vivo</span>
          </div>
          <div className="text-5xl sm:text-7xl lg:text-[84px] font-bold tracking-tight mb-4 text-foreground leading-none">R$ 0,00</div>
          
          <div className="flex items-center text-primary text-sm sm:text-lg font-medium mb-8 bg-primary/5 w-fit px-4 py-2 rounded-xl border border-primary/10">
             <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
             Meta do dia: R$ {userData?.dailyGoal ? (userData.dailyGoal).toFixed(2) : '0.00'}
          </div>
          
          {/* Progress Indication */}
          <div className="mt-auto">
             <div className="w-full bg-secondary h-3 rounded-full mb-2 overflow-hidden shadow-inner">
                <div className="bg-primary h-full w-[2%] rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
             </div>
            <div className="text-sm text-muted-foreground max-w-md mt-4">
              Nenhuma venda registrada ainda. Que tal começar agora?
            </div>
          </div>
        </div>
        
        {/* Info Grid */}
        <div className="grid grid-rows-2 gap-6">
          {/* Sub card 1 */}
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col justify-center shadow-lg border border-border/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-[12px] sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-2 font-medium">Itens mais vendidos</div>
            <div className="flex justify-between items-center mb-2 mt-4">
              <span className="text-foreground/50 text-sm italic">Sem dados suficientes</span>
            </div>
          </div>
          
          {/* Sub card 2 */}
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col justify-center shadow-lg border border-border/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB800]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-[12px] sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-2 font-medium">Contas a Receber</div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-2xl sm:text-3xl font-semibold opacity-80 text-foreground/40">R$ 0,00</span>
              <span className="text-[#FFB800] bg-[#FFB800]/10 px-3 py-1 rounded-full text-xs font-medium border border-[#FFB800]/20">Zeradinho</span>
            </div>
            <div className="text-[12px] opacity-60 mt-2">Nenhum valor pendente.</div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full mt-8 mb-4 z-10">
        <button onClick={() => setActiveAction('photo')} className="col-span-2 lg:col-span-1 h-[90px] sm:h-[120px] rounded-[20px] sm:rounded-[24px] bg-primary text-primary-foreground flex flex-col items-center justify-center gap-2 sm:gap-3 font-bold text-[14px] sm:text-[18px] cursor-pointer transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,255,102,0.25)] hover:shadow-[0_8px_30px_rgba(0,255,102,0.4)] active:scale-95 active:shadow-none">
          <Camera size={24} strokeWidth={2.5} />
          Lançar por Foto
        </button>
        <button onClick={() => setActiveAction('audio')} className="h-[90px] sm:h-[120px] rounded-[20px] sm:rounded-[24px] bg-card text-foreground border border-border flex flex-col items-center justify-center gap-2 sm:gap-3 font-semibold text-[14px] sm:text-[18px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/50 shadow-md active:scale-95">
          <div className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] rounded-full bg-secondary/80 flex items-center justify-center text-primary border border-primary/20"><Mic size={20} strokeWidth={2.5} /></div>
          Áudio
        </button>
        <button className="h-[90px] sm:h-[120px] rounded-[20px] sm:rounded-[24px] bg-card text-foreground border border-border flex flex-col items-center justify-center gap-2 sm:gap-3 font-semibold text-[14px] sm:text-[18px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/50 shadow-md active:scale-95">
          <div className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] rounded-full bg-secondary/80 flex items-center justify-center text-foreground/70 border border-border"><BarChart3 size={20} strokeWidth={2.5} /></div>
          Relatórios
        </button>
      </div>
    </div>
  );
}
