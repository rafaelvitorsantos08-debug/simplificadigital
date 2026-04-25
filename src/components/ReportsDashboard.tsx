import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Calendar, DollarSign, ListOrdered } from 'lucide-react';
import { Button } from './ui/button';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ReportsDashboard({ user, onBack }: any) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<{month: string, faturamento: number, custo: number, lucro: number}[]>([]);
  const [productStats, setProductStats] = useState<{produto: string, faturamento: number, custo: number, lucro: number, quantidade: number}[]>([]);
  const [activeTab, setActiveTab] = useState<'daily'|'monthly'|'all'|'products'>('daily');

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
      
      const totalRev = fetched.reduce((acc: number, curr: any) => acc + Number(curr.valor || 0), 0);
      const totalCst = fetched.reduce((acc: number, curr: any) => acc + Number(curr.custo || 0), 0);
      
      setTotalRevenue(totalRev);
      setTotalCost(totalCst);
      setTotalProfit(totalRev - totalCst);

      // Process Daily (Today)
      const today = new Date();
      today.setHours(0,0,0,0);
      const todaysSales = fetched.filter(s => s.createdAt && s.createdAt.toDate() >= today);
      setTodayRevenue(todaysSales.reduce((acc: number, curr: any) => acc + Number(curr.valor || 0), 0));

      // Process Monthly
      const monthlyMap: Record<string, { faturamento: number, custo: number, lucro: number }> = {};
      const productMap: Record<string, { faturamento: number, custo: number, lucro: number, quantidade: number }> = {};

      fetched.forEach((s: any) => {
        // --- Process Monthly ---
        if (s.createdAt) {
           const d = s.createdAt.toDate();
           const monthKey = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
           // capitalize first letter
           const formattedKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
           
           if (!monthlyMap[formattedKey]) {
              monthlyMap[formattedKey] = { faturamento: 0, custo: 0, lucro: 0 };
           }
           monthlyMap[formattedKey].faturamento += Number(s.valor || 0);
           monthlyMap[formattedKey].custo += Number(s.custo || 0);
           monthlyMap[formattedKey].lucro += (Number(s.valor || 0) - Number(s.custo || 0));
        }

        // --- Process Products ---
        const prodName = s.produto ? String(s.produto).trim() : 'Item não identificado';
        if (!productMap[prodName]) {
           productMap[prodName] = { faturamento: 0, custo: 0, lucro: 0, quantidade: 0 };
        }
        productMap[prodName].faturamento += Number(s.valor || 0);
        productMap[prodName].custo += Number(s.custo || 0);
        productMap[prodName].lucro += (Number(s.valor || 0) - Number(s.custo || 0));
        productMap[prodName].quantidade += 1;
      });
      
      const monthlyArr = Object.keys(monthlyMap).map(k => ({ 
        month: k, 
        faturamento: monthlyMap[k].faturamento,
        custo: monthlyMap[k].custo,
        lucro: monthlyMap[k].lucro
      }));
      setMonthlyStats(monthlyArr);

      const productArr = Object.keys(productMap)
        .map(k => ({ 
          produto: k, 
          faturamento: productMap[k].faturamento,
          custo: productMap[k].custo,
          lucro: productMap[k].lucro,
          quantidade: productMap[k].quantidade
        }))
        .sort((a, b) => b.lucro - a.lucro); // Ordenar por maior lucro
      setProductStats(productArr);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-card rounded-2xl p-5 border border-border shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-5"><ListOrdered size={80} /></div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4 relative z-10">
                  <div className="p-1.5 bg-secondary rounded-md text-foreground"><ListOrdered size={16} /></div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Faturamento Global</h3>
                </div>
                <p className="text-3xl font-bold relative z-10">R$ {totalRevenue.toFixed(2)}</p>
             </div>
             
             <div className="bg-card rounded-2xl p-5 border border-destructive/20 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Package size={80} /></div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4 relative z-10">
                  <div className="p-1.5 bg-destructive/10 rounded-md text-destructive"><Package size={16} /></div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Custo Total Global</h3>
                </div>
                <p className="text-3xl font-bold relative z-10 text-destructive">R$ {totalCost.toFixed(2)}</p>
             </div>

             <div className="bg-card rounded-2xl p-5 border border-primary/20 shadow-[0_0_15px_rgba(0,255,102,0.1)] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={80} /></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-primary">
                    <div className="p-1.5 bg-primary/10 rounded-md"><TrendingUp size={16} /></div>
                    <h3 className="font-semibold text-sm uppercase tracking-wide">Lucro Líquido Global</h3>
                  </div>
                  {totalCost > 0 && (
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">
                      Margem: {((totalProfit / totalCost) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold relative z-10 text-primary">R$ {totalProfit.toFixed(2)}</p>
             </div>

             <div className="bg-card rounded-2xl p-5 border border-border shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={80} /></div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4 relative z-10">
                  <div className="p-1.5 bg-secondary rounded-md text-foreground"><DollarSign size={16} /></div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Caixa Hoje</h3>
                </div>
                <p className="text-3xl font-bold relative z-10 text-foreground">R$ {todayRevenue.toFixed(2)}</p>
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
                 Mensal
               </button>
               <button 
                 className={`flex-1 p-4 font-semibold text-sm transition-colors ${activeTab === 'products' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}
                 onClick={() => setActiveTab('products')}
               >
                 Por Produto (Margem)
               </button>
               <button 
                 className={`flex-1 p-4 font-semibold text-sm transition-colors ${activeTab === 'all' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}
                 onClick={() => setActiveTab('all')}
               >
                 Todas Vendas
               </button>
            </div>

            <div className="p-6">
              {activeTab === 'monthly' ? (
                 <div className="flex flex-col gap-3">
                   {monthlyStats.length === 0 ? (
                      <p className="text-muted-foreground text-center py-10">Nenhum dado mensal disponível.</p>
                   ) : (
                      monthlyStats.map((stat, idx) => (
                         <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-secondary/30 rounded-xl border border-border gap-4">
                            <p className="font-bold text-lg capitalize">{stat.month}</p>
                            <div className="flex gap-4 sm:gap-8 w-full sm:w-auto">
                              <div>
                                 <p className="text-[10px] text-muted-foreground uppercase font-semibold">Custo</p>
                                 <p className="text-sm text-destructive font-medium">R$ {stat.custo.toFixed(2)}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-muted-foreground uppercase font-semibold">Faturamento</p>
                                 <p className="text-sm font-medium">R$ {stat.faturamento.toFixed(2)}</p>
                              </div>
                              <div className="text-right ml-auto sm:ml-0 flex items-center gap-4">
                                 <div>
                                   <p className="text-[10px] text-primary uppercase font-bold text-left ml-1">Margem Média</p>
                                   <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 mr-2">
                                     {stat.custo > 0 ? ((stat.lucro / stat.custo) * 100).toFixed(1) : 100}%
                                   </span>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-[10px] text-primary uppercase font-bold">Lucro Líquido</p>
                                   <p className="font-bold text-xl text-primary">R$ {stat.lucro.toFixed(2)}</p>
                                 </div>
                              </div>
                            </div>
                         </div>
                      ))
                   )}
                 </div>
              ) : activeTab === 'products' ? (
                 <div className="flex flex-col gap-3">
                   {productStats.length === 0 ? (
                      <p className="text-muted-foreground text-center py-10">Nenhuma venda registrada ainda.</p>
                   ) : (
                      productStats.map((stat, idx) => (
                         <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-secondary/30 rounded-xl border border-border gap-4">
                            <div>
                               <p className="font-bold text-lg">{stat.produto}</p>
                               <span className="inline-block px-2.5 py-1 mt-2 text-[10px] font-bold uppercase tracking-wider border rounded-md bg-secondary text-muted-foreground">
                                 Vendidos: {stat.quantidade} un.
                               </span>
                            </div>
                            <div className="flex gap-4 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0">
                              <div>
                                 <p className="text-[10px] text-muted-foreground uppercase font-semibold">Custo Total</p>
                                 <p className="text-sm text-destructive font-medium">R$ {stat.custo.toFixed(2)}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-muted-foreground uppercase font-semibold">Faturado</p>
                                 <p className="text-sm font-medium">R$ {stat.faturamento.toFixed(2)}</p>
                              </div>
                              <div className="text-right ml-auto sm:ml-0 flex items-center gap-4">
                                 <div>
                                   <p className="text-[10px] text-primary uppercase font-bold text-left ml-1">Margem</p>
                                   <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 mr-2">
                                     {stat.custo > 0 ? ((stat.lucro / stat.custo) * 100).toFixed(1) : 100}%
                                   </span>
                                 </div>
                                 <div>
                                   <p className="text-[10px] text-primary uppercase font-bold">Lucro Líquido</p>
                                   <p className="font-bold text-xl text-primary">R$ {stat.lucro.toFixed(2)}</p>
                                 </div>
                              </div>
                            </div>
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
                          <div key={sale.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-secondary/30 rounded-xl border border-border gap-2">
                             <div>
                                <p className="font-bold text-lg">{sale.produto || "Item não identificado"}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(sale.createdAt)} • {sale.pagamento || "-"}</p>
                             </div>
                             <div className="flex gap-4 sm:gap-6 text-right w-full sm:w-auto items-center mt-2 sm:mt-0">
                                {sale.custo > 0 && (
                                   <>
                                     <div className="text-left sm:text-right hidden sm:block">
                                       <p className="text-[10px] text-muted-foreground uppercase font-semibold">Custo</p>
                                       <p className="text-xs text-destructive">R$ {Number(sale.custo).toFixed(2)}</p>
                                     </div>
                                     <div className="text-left sm:text-right hidden sm:block">
                                       <p className="text-[10px] text-muted-foreground uppercase font-semibold">Venda</p>
                                       <p className="text-xs text-foreground">R$ {Number(sale.valor || 0).toFixed(2)}</p>
                                     </div>
                                     <div className="text-left sm:text-right">
                                       <p className="text-[10px] text-primary uppercase font-bold">Margem</p>
                                       <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 inline-block mt-0.5">
                                         {(((Number(sale.valor || 0) - Number(sale.custo)) / Number(sale.custo)) * 100).toFixed(1)}%
                                       </span>
                                     </div>
                                   </>
                                )}
                                <div className="text-right ml-auto sm:ml-0 bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                   <p className="text-[10px] text-primary uppercase font-bold">{sale.custo > 0 ? 'Lucro' : 'Valor Total'}</p>
                                   <p className="font-bold text-lg text-primary">R$ {Number(sale.custo > 0 ? sale.lucro : (sale.valor || 0)).toFixed(2)}</p>
                                </div>
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
