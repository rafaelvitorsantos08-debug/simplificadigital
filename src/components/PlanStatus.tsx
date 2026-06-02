import React, { useState } from 'react';
import { ArrowLeft, Crown, Check, AlertCircle, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { useLimits } from '../hooks/useLimits';

export default function PlanStatus({ onBack }: { onBack: () => void }) {
  const { activePlanType, limits, salesTodayCount, inventoryCount, clientsTodayCount } = useLimits();
  const [showPlans, setShowPlans] = useState(false);
  
  const getPercentage = (current: number, max: number) => {
    if (limits.isIlimitado) return 0;
    return Math.min(100, (current / max) * 100);
  };

  const handlePayment = (planName: string, amount: number) => {
    alert(`Redirecionando para fechar o plano ${planName} via Mercado Pago...\n(Integração oficial MCP em breve)`);
    // Após pagamento aprovado, webhook do MCP atualiza o userData.planType no Firestore.
  };

  if (showPlans) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setShowPlans(false)} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-2">Escolha seu plano</h2>
        </header>

        <section className="w-full relative animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {/* FREE */}
              <div className="bg-card border border-border rounded-3xl p-8 flex flex-col shadow-lg flex-1">
                 <h3 className="text-2xl font-bold mb-2">Grátis</h3>
                 <div className="text-4xl font-extrabold mb-2 tracking-tight">R$ 0<span className="text-lg text-muted-foreground font-normal">/mês</span></div>
                 <p className="text-sm text-muted-foreground mb-6">Para quem está dando os primeiros passos e quer testar a praticidade.</p>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> 5 Vendas por dia (áudio/scanner/manual)</li>
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> 10 Itens no estoque máximo</li>
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> Registre até 5 Clientes por dia</li>
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> Relatórios Diários</li>
                 </ul>
                 <Button disabled variant="outline" className="w-full h-12 font-bold border-primary text-primary hover:bg-primary/10">Plano Atual</Button>
              </div>

              {/* PLUS (Destaque) */}
              <div className="bg-secondary border-2 border-primary rounded-3xl p-8 flex flex-col shadow-2xl relative transform md:-translate-y-4 flex-1 mt-4 md:mt-0">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Zap size={14} fill="currentColor" /> Mais Popular
                 </div>
                 <h3 className="text-2xl font-bold mb-2 text-foreground">Plus</h3>
                 <div className="text-4xl font-extrabold mb-2 tracking-tight text-foreground">R$ 39,90<span className="text-lg text-muted-foreground font-normal">/mês</span></div>
                 <p className="text-sm text-muted-foreground mb-6">Escaneie, fale e controle seu estoque com muito mais tranquilidade.</p>
                 <ul className="space-y-4 mb-8 flex-1">
                   <li className="flex gap-3 text-sm font-medium text-foreground"><Check className="text-primary w-5 h-5 shrink-0" /> 30 Vendas por dia</li>
                   <li className="flex gap-3 text-sm font-medium text-foreground"><Check className="text-primary w-5 h-5 shrink-0" /> 60 Itens no estoque</li>
                   <li className="flex gap-3 text-sm font-medium text-foreground"><Check className="text-primary w-5 h-5 shrink-0" /> Registre 30 Clientes por dia</li>
                   <li className="flex gap-3 text-sm font-medium text-foreground"><Check className="text-primary w-5 h-5 shrink-0" /> Suporte Premium</li>
                 </ul>
                 <Button onClick={() => handlePayment('Plus', 39.90)} className="w-full h-12 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                   Assinar Plus
                 </Button>
              </div>

              {/* PRO */}
              <div className="bg-card border border-border rounded-3xl p-8 flex flex-col shadow-lg relative overflow-hidden flex-1">
                 <div className="absolute -top-10 -right-10 text-primary/10">
                    <Crown size={150} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2 relative z-10">Pro</h3>
                 <div className="text-4xl font-extrabold mb-2 tracking-tight relative z-10">R$ 59,90<span className="text-lg text-muted-foreground font-normal">/mês</span></div>
                 <p className="text-sm text-muted-foreground mb-6 relative z-10">Tudo liberado. Nenhum limite. O controle definitivo do seu empreendimento.</p>
                 <ul className="space-y-4 mb-8 flex-1 relative z-10">
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> Vendas Ilimitadas ♾️</li>
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> Estoque Ilimitado ♾️</li>
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> CRM de Clientes Ilimitado ♾️</li>
                   <li className="flex gap-3 text-sm font-medium"><Check className="text-primary w-5 h-5 shrink-0" /> IA Prioritária de Alta Velocidade</li>
                 </ul>
                 <Button onClick={() => handlePayment('Pro', 59.90)} variant="secondary" className="w-full h-12 font-bold hover:bg-secondary/80 relative z-10 border border-border/80">
                   Assinar Pro
                 </Button>
              </div>
           </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-2xl mx-auto">
       <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">Meu Plano</h2>
      </header>

      <section className="bg-card border border-border shadow-xl rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
         {activePlanType === 'pro' && (
           <div className="absolute top-0 right-0 p-8 text-primary/10">
             <Crown size={120} />
           </div>
         )}
         
         <div className="mb-2 relative z-10">
            <span className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Plano Atual</span>
         </div>
         <div className="text-4xl font-black mb-6 capitalize text-foreground relative z-10 flex items-center gap-3">
            {activePlanType}
            {activePlanType !== 'free' && <Check className="text-primary w-8 h-8"/>}
         </div>

         {activePlanType === 'free' && (
           <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-8 relative z-10">
             <p className="text-sm font-medium text-foreground">
               Você está no plano Grátis. Atualize para o <strong className="text-primary">Plus ou Pro</strong> para aumentar seus limites diários e vender muito mais!
             </p>
           </div>
         )}

         <div className="space-y-6 relative z-10">
            {/* Sales Limits */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-muted-foreground">Vendas (Hoje)</span>
                <span className="text-sm font-medium">
                   {salesTodayCount} / {limits.isIlimitado ? '∞' : limits.vendasDiarias}
                </span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all ${limits.isIlimitado ? 'bg-primary' : (getPercentage(salesTodayCount, limits.vendasDiarias) >= 100 ? 'bg-destructive' : 'bg-primary')}`}
                   style={{ width: `${limits.isIlimitado ? 100 : getPercentage(salesTodayCount, limits.vendasDiarias)}%` }}
                 />
              </div>
            </div>

            {/* Inventory */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-muted-foreground">Itens em Estoque</span>
                <span className="text-sm font-medium">
                   {inventoryCount} / {limits.isIlimitado ? '∞' : limits.estoque}
                </span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all ${limits.isIlimitado ? 'bg-[#FFB800]' : (getPercentage(inventoryCount, limits.estoque) >= 100 ? 'bg-destructive' : 'bg-[#FFB800]')}`}
                   style={{ width: `${limits.isIlimitado ? 100 : getPercentage(inventoryCount, limits.estoque)}%` }}
                 />
              </div>
            </div>

            {/* CRM Clients Limit */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-muted-foreground">Clientes Registrados (Hoje)</span>
                <span className="text-sm font-medium">
                   {clientsTodayCount} / {limits.isIlimitado ? '∞' : limits.clientesDiarios}
                </span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all ${limits.isIlimitado ? 'bg-[#00E5FF]' : (getPercentage(clientsTodayCount, limits.clientesDiarios) >= 100 ? 'bg-destructive' : 'bg-[#00E5FF]')}`}
                   style={{ width: `${limits.isIlimitado ? 100 : getPercentage(clientsTodayCount, limits.clientesDiarios)}%` }}
                 />
              </div>
            </div>
         </div>
      </section>

      {activePlanType === 'free' && (
         <Button size="lg" className="h-14 w-full shadow-lg text-lg animate-[pulse_2s_ease-in-out_infinite]" onClick={() => setShowPlans(true)}>
           Conhecer Planos Premium
         </Button>
      )}
    </div>
  );
}
