import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function ReportsDashboard({ user, onBack }: any) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'sales'), 
        where('userId', '==', user.uid)
        // Note: Ordering might require an explicit Firestore index if combined with inequality checks, 
        // but for now we fetch and sort on client if index is unbuilt.
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      fetched.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setSales(fetched);
      
      const total = fetched.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
      setTotalRevenue(total);
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3"><BarChart3 className="text-primary"/> Relatório de Vendas</h2>
        <Button variant="outline" onClick={onBack}>Voltar</Button>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><p className="text-muted-foreground">Carregando métricas...</p></div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                  <div className="p-2 bg-primary/10 rounded-md text-primary"><TrendingUp size={20} /></div>
                  <h3 className="font-semibold text-lg">Faturamento Total</h3>
                </div>
                <p className="text-4xl font-bold text-primary">R$ {totalRevenue.toFixed(2)}</p>
             </div>
             <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
                <div className="flex items-center gap-3 text-muted-foreground mb-4">
                  <div className="p-2 bg-secondary rounded-md text-foreground"><Package size={20} /></div>
                  <h3 className="font-semibold text-lg">Histórico de Vendas</h3>
                </div>
                <p className="text-4xl font-bold">{sales.length} vendas</p>
             </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-md mt-4">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Calendar className="w-5 h-5 text-muted-foreground" /> Extrato Detalhado</h3>
            
            {sales.length === 0 ? (
               <p className="text-muted-foreground text-center py-10">Nenhuma venda registrada no sistema.</p>
            ) : (
              <div className="flex flex-col gap-3">
                 {sales.map((sale) => (
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
          </div>
        </div>
      )}
    </div>
  );
}
