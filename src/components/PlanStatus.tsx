import React from 'react';
import { ArrowLeft, Crown, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useLimits } from '../hooks/useLimits';

export default function PlanStatus({ onBack }: { onBack: () => void }) {
  const { activePlanType, limits, salesTodayCount, inventoryCount, clientsTodayCount } = useLimits();
  
  const getPercentage = (current: number, max: number) => {
    if (limits.isIlimitado) return 0;
    return Math.min(100, (current / max) * 100);
  };

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
         <Button size="lg" className="h-14 w-full shadow-lg text-lg animate-[pulse_2s_ease-in-out_infinite]" onClick={() => window.open('/', '_blank')}>
           Conhecer Planos Premium
         </Button>
      )}
    </div>
  );
}
