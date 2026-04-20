import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Tag, Target, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OnboardingFlow({ onComplete }: { onComplete: (data: any) => Promise<void> }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ businessName: '', segment: '', dailyGoal: '' });
  const [loading, setLoading] = useState(false);

  const nextStep = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await onComplete({
          ...data,
          dailyGoal: parseFloat(data.dailyGoal) || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
        <div className="w-full max-w-sm z-10 relative mt-8">
        <div className="flex justify-between mb-8 px-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`h-1 flex-1 mx-1 rounded-full bg-secondary overflow-hidden`}
            >
              <div 
                className={`h-full bg-primary transition-all duration-500 ease-in-out ${step >= i ? 'w-full' : 'w-0'}`} 
              />
            </div>
          ))}
        </div>

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary mb-4 shadow-xl border border-border">
                  <Store size={32} />
                </div>
              </div>
              <h2 className="text-3xl font-semibold mb-2 text-center tracking-tight text-foreground">Como se chama o seu negócio?</h2>
              <p className="text-muted-foreground text-center mb-8">O nome que seus clientes conhecem.</p>
              
              <form onSubmit={nextStep} className="space-y-6">
                <div className="space-y-2">
                  <Input 
                    autoFocus
                    placeholder="Ex: Doce Sabor, Padaria Central..." 
                    className="h-14 text-lg bg-card border-border placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
                    value={data.businessName}
                    onChange={(e) => setData({ ...data, businessName: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 text-lg font-medium shadow-primary/20 shadow-lg">
                  Continuar <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary mb-4 shadow-xl border border-border">
                  <Tag size={32} />
                </div>
              </div>
              <h2 className="text-3xl font-semibold mb-2 text-center tracking-tight text-foreground">Qual o seu ramo?</h2>
              <p className="text-muted-foreground text-center mb-8">Escolha sua categoria.</p>
              
              <form onSubmit={nextStep} className="space-y-6">
                <div className="space-y-2">
                  <Input 
                    autoFocus
                    placeholder="Ex: Vestuário, Salão de beleza..." 
                    className="h-14 text-lg bg-card border-border placeholder:text-muted-foreground focus-visible:ring-primary shadow-sm"
                    value={data.segment}
                    onChange={(e) => setData({ ...data, segment: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Alimentação', 'Salão de Beleza', 'Roupas', 'Eletrônicos'].map(cat => (
                    <div 
                      key={cat} 
                      onClick={() => setData({ ...data, segment: cat })}
                      className={`px-4 py-2 border rounded-full text-sm cursor-pointer transition-colors ${
                        data.segment === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                      }`}
                    >
                      {cat}
                    </div>
                  ))}
                </div>

                <Button type="submit" size="lg" className="w-full h-14 text-lg font-medium shadow-primary/20 shadow-lg">
                  Continuar <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary mb-4 shadow-xl border border-border">
                  <Target size={32} />
                </div>
              </div>
              <h2 className="text-3xl font-semibold mb-2 text-center tracking-tight text-foreground">Meta diária</h2>
              <p className="text-muted-foreground text-center mb-8">Quanto você quer vender por dia?</p>
              
              <form onSubmit={nextStep} className="space-y-6">
                <div className="space-y-2 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">R$</span>
                  <Input 
                    autoFocus
                    type="number"
                    placeholder="0.00"
                    step="0.01" 
                    className="h-14 pl-12 text-lg bg-card border-border focus-visible:ring-primary shadow-sm"
                    value={data.dailyGoal}
                    onChange={(e) => setData({ ...data, dailyGoal: e.target.value })}
                    required
                  />
                </div>
                <Button disabled={loading} type="submit" size="lg" className="w-full h-14 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 shadow-lg">
                  {loading ? 'Salvando...' : 'Finalizar'} <Check className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          )}

      </div>
  );
}
