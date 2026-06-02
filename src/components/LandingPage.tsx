import React from 'react';
import { Sparkles, Loader2, LogIn, Check, Crown, Zap, ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { loginWithGoogle, loginWithGoogleRedirect, error, loading, user } = useAuth();
  
  const handlePayment = async (planName: string, amount: number) => {
    if (!user) {
        alert("Por favor, faça login ou cadastre-se primeiro antes de assinar.");
        return loginWithGoogle();
    }
    try {
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planName.toLowerCase(),
          amount,
          email: user?.email,
          uid: user?.uid
        })
      });
      const data = await res.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Erro ao gerar pagamento.');
      }
    } catch (e) {
      alert("Erro de conexão ao gerar pagamento.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      <div className="absolute top-0 w-full h-screen bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto">
         <div className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
           SIMPLIFICA<span className="text-primary">DIGITAL</span>
         </div>
         <Button onClick={loginWithGoogle} variant="outline" className="font-semibold text-xs sm:text-sm shadow-sm gap-2 whitespace-nowrap px-4 py-2 hover:bg-secondary">
           <LogIn className="w-4 h-4" /> Entrar
         </Button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-10 pb-20 max-w-6xl mx-auto">
         <div className="flex justify-center mb-6 animate-fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-secondary flex items-center justify-center text-primary shadow-2xl border border-border">
               <Sparkles size={36} />
            </div>
         </div>
         
         <h1 className="text-4xl sm:text-6xl max-w-3xl text-center font-bold mb-6 tracking-tight text-foreground leading-[1.1] animate-fade-in" style={{animationDelay: '100ms'}}>
           Pare de perder dinheiro por falta de organização.
         </h1>
         <p className="text-muted-foreground text-center text-lg sm:text-xl max-w-2xl mb-10 animate-fade-in" style={{animationDelay: '200ms'}}>
           Um sistema de vendas no seu bolso com controle de estoque, leitura de QR Code e registro por voz através de Inteligência Artificial.
         </p>
         
         {error && (
           <div className="mb-6 p-4 max-w-md w-full bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-left shadow-sm">
             <p className="font-semibold mb-1">Aviso</p>
             <p>{error}</p>
             {error.includes('Vercel') || error.includes('domínio') ? (
               <p className="mt-2 text-xs opacity-80">
                 Acesse o console do Firebase &gt; Authentication &gt; Settings &gt; Authorized domains e adicione seu domínio. <br />
                 Se estiver usando a Vercel, pegue o URL que aparece no seu navegador.
               </p>
             ) : null}
           </div>
         )}
         
         {loading ? (
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
         ) : (
             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-fade-in" style={{animationDelay: '300ms'}}>
                 <Button onClick={loginWithGoogle} size="lg" className="w-full h-14 text-lg font-bold shadow-primary/20 shadow-xl">
                   Começar Grátis Agora <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
                 <Button variant="outline" size="lg" className="h-14 font-semibold text-muted-foreground hover:text-foreground" onClick={loginWithGoogleRedirect}>
                   Dificuldade para Entrar?
                 </Button>
             </div>
         )}

         {/* Planos Section */}
         <section className="w-full mt-32 relative animate-fade-in" style={{animationDelay: '400ms'}}>
           <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-5xl font-bold mb-4">Escolha seu plano</h2>
             <p className="text-muted-foreground text-lg">Comece a transformar seu negócio hoje mesmo.</p>
           </div>
           
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
                 <Button onClick={loginWithGoogle} variant="outline" className="w-full h-12 font-bold border-primary text-primary hover:bg-primary/10">Criar Conta Grátis</Button>
              </div>

              {/* PLUS (Destaque) */}
              <div className="bg-secondary border-2 border-primary rounded-3xl p-8 flex flex-col shadow-2xl relative transform md:-translate-y-4 flex-1">
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
      </main>

      {/* Footer minimalista */}
      <footer className="border-t border-border mt-32 py-10 px-6 text-center text-sm text-muted-foreground">
         <p>© 2026 Simplifica Digital. Pagamentos seguros via Mercado Pago.</p>
      </footer>
    </div>
  );
}
