import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Calendar, DollarSign, ListOrdered } from 'lucide-react';
import { Button } from './ui/button';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ReportsDashboard({ user, onBack }: any) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<{month: string, total: number}[]>([]);
  const [activeTab, setActiveTab] = useState<'daily'|'monthly'|'all'>('daily');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'sales'), 
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const fetched: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      fetched.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setSales(fetched);
      
      const total = fetched.reduce((acc: number, curr: any) => acc + Number(curr.valor || 0), 0);
      setTotalRevenue(total);

      // Process Daily (Today)
      const today = new Date();
      today.setHours(0,0,0,0);
      const todaysSales = fetched.filter(s => s.createdAt && s.createdAt.toDate() >= today);
      setTodayRevenue(todaysSales.reduce((acc: number, curr: any) => acc + Number(curr.valor || 0), 0));

      // Process Monthly
      const monthlyMap: Record<string, number> = {};
      fetched.forEach((s: any) => {
        if (!s.createdAt) return;
        const d = s.createdAt.toDate();
        const monthKey = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
        // capitalize first letter
        const formattedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
        monthlyMap[formattedKey] = (monthlyMap[formattedKey] || 0) + Number(s.valor || 0);
      });
      
      const monthlyArr = Object.keys(monthlyMap).map(k => ({ month: k, total: monthlyMap[k] }));
      setMonthlyStats(monthlyArr);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user.uid]);

  const formatDate = (timestamp: any) => {
     if (!timestamp) return 'Recente';
     const date = timestamp.toDate();
     return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const today = new Date();
  today.setHours(0,0,0,0);
  const displayedSales = activeTab === 'daily' ? sales.filter(s => s.createdAt && s.createdAt.toDate() >= today) : sales;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3"><BarChart3 className="text-primary"/> Relatórios e Dashboard</h2>
        <Button variant="outline" onClick={onBack}>Voltar</Button>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><p className="text-muted-foreground">Carregando métricas...</p></div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-card rounded-2xl p-6 border border-border shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={80} /></div>
                <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
                  <div className="p-2 bg-primary/10 rounded-md text-primary"><TrendingUp size={20} /></div>
                  <h3 className="font-semibold text-lg">Fechamento do Dia</h3>
                </div>
                <p className="text-4xl font-bold text-primary relative z-10">R$ {todayRevenue.toFixed(2)}</p>
             </div>
             <div className="bg-card rounded-2xl p-6 border border-border shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><BarChart3 size={80} /></div>
                <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
                  <div className="p-2 bg-secondary rounded-md text-foreground"><ListOrdered size={20} /></div>
                  <h3 className="font-semibold text-lg">Faturamento Total</h3>
                </div>
                <p className="text-4xl font-bold relative z-10">R$ {totalRevenue.toFixed(2)}</p>
             </div>
             <div className="bg-card rounded-2xl p-6 border border-border shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Package size={80} /></div>
                <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
                  <div className="p-2 bg-secondary rounded-md text-foreground"><Calendar size={20} /></div>
                  <h3 className="font-semibold text-lg">Histórico de Vendas</h3>
                </div>
                <p className="text-4xl font-bold relative z-10">{sales.length} vendas</p>
             </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-md mt-4 overflow-hidden">
            <div className="flex border-b border-border bg-secondary/20">
               <button 
                 className={`flex-1 p-4 font-semibold text-sm transition-colors ${activeTab === 'daily' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}
                 onClick={() => setActiveTab('daily')}
               >
                 Extrato de Hoje (Caixa)
               </button>
               <button 
                 className={`flex-1 p-4 font-semibold text-sm transition-colors ${activeTab === 'monthly' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}
                 onClick={() => setActiveTab('monthly')}
               >
                 Demonstrativo Mensal
               </button>
               <button 
                 className={`flex-1 p-4 font-semibold text-sm transition-colors ${activeTab === 'all' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}
                 onClick={() => setActiveTab('all')}
               >
                 Todas as Vendas
               </button>
            </div>

            <div className="p-6">
              {activeTab === 'monthly' ? (
                 <div className="flex flex-col gap-3">
                   {monthlyStats.length === 0 ? (
                      <p className="text-muted-foreground text-center py-10">Nenhum dado mensal disponível.</p>
                   ) : (
                      monthlyStats.map((stat, idx) => (
                         <div key={idx} className="flex justify-between items-center p-4 bg-secondary/30 rounded-xl border border-border">
                            <p className="font-bold text-lg capitalize">{stat.month}</p>
                            <p className="font-bold text-xl text-primary">R$ {stat.total.toFixed(2)}</p>
                         </div>
                      ))
                   )}
                 </div>
              ) : (
                <>
                  {displayedSales.length === 0 ? (
                     <p className="text-muted-foreground text-center py-10">Nenhuma venda registrada {activeTab === 'daily' ? 'hoje' : 'no sistema'}.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                       {displayedSales.map((sale) => (
                          <div key={sale.id} className="flex justify-between items-center p-4 bg-secondary/30 rounded-xl border border-border">
                             <div>
                                <p className="font-bold text-lg">{sale.produto || "Item não identificado"}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(sale.createdAt)} • {sale.pagamento || "-"}</p>
                             </div>
                             <div className="text-right">
                                <p className="font-bold text-lg text-primary">R$ {Number(sale.valor || 0).toFixed(2)}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
