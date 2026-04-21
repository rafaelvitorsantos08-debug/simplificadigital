import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, BarChart3, TrendingUp, PackagePlus, UserPlus, X, Phone, StopCircle, RefreshCcw, Loader2, CheckCircle2, Pencil, Check } from 'lucide-react';
import { Button } from './ui/button';
import { processAudioSale, processPhotoSale } from '../services/geminiService';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

import InventoryManager from './InventoryManager';
import ClientManager from './ClientManager';
import ReportsDashboard from './ReportsDashboard';
import QRScanner from './QRScanner';

export default function Dashboard({ userData, user, logout, updateUserData }: any) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('');
  
  // Dashboard Sales State (Simulated for this session)
  const [todayTotal, setTodayTotal] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Forçar fechamento e limpeza de qualquer mídia
  const closeAction = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setActiveAction(null);
    setSaleResult(null);
    setIsProcessing(false);
    setIsRecording(false);
  };

  const handleQRScan = async (decodedText: string) => {
    // Process the scanned QR code
    setIsProcessing(true);
    try {
      // Find the product in inventory based on the QR code text
      const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      let targetProduct: any = null;
      const searchName = decodedText.toLowerCase();

      snapshot.forEach(d => {
        const invName = (d.data().name || '').toLowerCase();
        if (invName === searchName || invName.includes(searchName) || searchName.includes(invName)) {
           targetProduct = { id: d.id, ...d.data() };
        }
      });

      let saleData;
      if (targetProduct) {
         saleData = {
           produto: targetProduct.name,
           valor: Number(targetProduct.price),
           pagamento: 'Via QR Code Scanner'
         };
      } else {
         saleData = {
           produto: decodedText,
           valor: 0,
           pagamento: 'Via QR Code Scanner (Não encontrado)'
         };
      }
      
      setSaleResult(saleData);
      await saveSaleToDB(saleData);
    } catch(e) {
      console.error(e);
      alert("Erro ao processar código QR.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Fetch today's sales
    const fetchTodaySales = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      try {
        const q = query(
          collection(db, 'sales'),
          where('userId', '==', user.uid),
          where('createdAt', '>=', today)
        );
        const snapshot = await getDocs(q);
        let total = 0;
        snapshot.forEach(doc => {
          total += Number(doc.data().valor || 0);
        });
        setTodayTotal(total);
      } catch(e) {
        console.error("Error fetching sales: ", e);
      }
    };
    fetchTodaySales();
  }, [user.uid]);

  const saveSaleToDB = async (saleData: any) => {
    try {
      await addDoc(collection(db, 'sales'), {
        ...saleData,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      // Fetch again to ensure accuracy or just add to state
      setTodayTotal(prev => prev + Number(saleData.valor || 0));

      // Diminuir do inventário automaticamente
      if (saleData.produto) {
        const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        let targetDoc: any = null;
        const searchName = saleData.produto.toLowerCase();
        
        snapshot.forEach(d => {
          const invName = (d.data().name || '').toLowerCase();
          if (invName === searchName) {
            targetDoc = d;
          } else if (invName.includes(searchName) || searchName.includes(invName)) {
            if (!targetDoc) targetDoc = d;
          }
        });

        if (targetDoc) {
          const currentQty = targetDoc.data().qty || 0;
          if (currentQty > 0) {
            await updateDoc(doc(db, 'inventory', targetDoc.id), {
              qty: currentQty - 1
            });
          }
        }
      }

    } catch(e) {
      console.error("Erro ao salvar venda/estoque:", e);
    }
  };

  // 2. Funções de Áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        setIsProcessing(true);
        mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
        
        try {
          const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          const inventoryNames = snapshot.docs.map(d => d.data().name);

          const data = await processAudioSale(audioBlob, inventoryNames);
          setSaleResult(data);
          await saveSaleToDB(data);
        } catch (e: any) {
          alert("Erro na IA: " + e.message);
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro no microfone:", err);
      alert("Permissão de microfone negada ou não encontrado.");
      setActiveAction(null);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Renderização UI do Processamento (IA)
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-6" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">A Mágica da IA do Google</h2>
        <p className="text-muted-foreground">Extraindo informações, valores e itens da sua venda automaticamente...</p>
      </div>
    );
  }

  // Renderização do Sucesso (IA)
  if (saleResult) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
           <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-6">Venda Registrada!</h2>
        
        <div className="bg-card border border-border w-full p-6 p-y-4 rounded-2xl text-left mb-8 shadow-lg">
           <p className="text-sm text-muted-foreground mb-1">Produto / Serviço</p>
           <p className="font-semibold text-lg mb-4">{saleResult.produto || "Não identificado"}</p>
           
           <p className="text-sm text-muted-foreground mb-1">Valor Estimado</p>
           <p className="font-bold text-2xl mb-4 text-primary">R$ {Number(saleResult.valor || 0).toFixed(2)}</p>
           
           <p className="text-sm text-muted-foreground mb-1">Forma de Pagamento</p>
           <p className="font-semibold">{saleResult.pagamento || "Não identificado"}</p>
        </div>

        <Button size="lg" className="w-full h-14 text-lg" onClick={closeAction}>Voltar ao Início</Button>
      </div>
    );
  }

  // --- RENDERS DE TELAS INTEIRAS (Ações Principais) ---

  if (activeAction === 'audio') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center justify-center">
         <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 transition-all duration-300 ${isRecording ? 'bg-primary/20 border-primary animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_40px_rgba(0,255,102,0.6)]' : 'bg-secondary border-border'}`}>
            <Mic className={`w-16 h-16 ${isRecording ? 'text-primary' : 'text-muted-foreground'}`} />
         </div>
         <h2 className="text-2xl font-bold mb-2">{isRecording ? "Gravando..." : "Gravar Venda em Áudio"}</h2>
         <p className="text-muted-foreground mb-10 text-center max-w-md">
           {isRecording ? "Fale pausadamente. Cancele ou conclua ao terminar." : `Descreva sua venda, ex: "Vendi uma camiseta preta G por 60 reais no PIX."`}
         </p>
         
         <div className="flex gap-4">
           {isRecording ? (
             <>
               <Button variant="outline" size="lg" className="h-14 px-6 border-destructive text-destructive hover:bg-destructive/10" onClick={stopRecording}>
                 <StopCircle className="mr-2" /> Cancelar
               </Button>
               <Button size="lg" className="h-14 px-8 shadow-[0_0_15px_rgba(0,255,102,0.4)] text-lg" onClick={stopRecording}>
                 Processar Venda
               </Button>
             </>
           ) : (
             <>
               <Button variant="outline" size="lg" className="h-14 px-6" onClick={() => setActiveAction(null)}>Voltar</Button>
               <Button size="lg" className="h-14 px-8 shadow-[0_0_15px_rgba(0,255,102,0.4)] text-lg" onClick={startRecording}>
                 Começar a Gravar
               </Button>
             </>
           )}
         </div>
      </div>
    );
  }

  if (activeAction === 'scanner') {
     return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center justify-center">
         <h2 className="text-2xl font-bold mb-6">QR Code Scanner</h2>
         <p className="text-muted-foreground mb-8 text-center max-w-sm">Escaneie o QR Code do produto para registrar a venda automaticamente e abater o estoque.</p>
         
         <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center">
             <QRScanner onScan={handleQRScan} onClose={closeAction} />
         </div>
      </div>
     );
  }

  if (activeAction === 'inventory') {
    return <InventoryManager user={user} onBack={() => setActiveAction(null)} />;
  }

  if (activeAction === 'clients') {
    return <ClientManager user={user} onBack={() => setActiveAction(null)} />;
  }

  if (activeAction === 'reports') {
    return <ReportsDashboard user={user} onBack={() => setActiveAction(null)} />;
  }

  // --- DASHBOARD PRINCIPAL ---

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto h-full relative">
      
      {/* HEADER */}
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

      {/* GRID DE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 flex-1 w-full relative">
        
        {/* Painel Central de Receita */}
        <div className="bg-card rounded-[32px] p-8 sm:p-10 relative border-l-[6px] sm:border-l-[8px] border-primary flex flex-col shadow-xl">
          <div className="text-xs sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-4 font-medium flex justify-between items-center w-full">
             <span>Vendas Hoje</span>
             <span className="text-primary/60 bg-primary/10 px-2 py-1 rounded-md text-[10px] tracking-normal border border-primary/20 flex items-center gap-1">
               <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div> Ao vivo
             </span>
          </div>
          <div className="text-5xl sm:text-7xl lg:text-[84px] font-bold tracking-tight mb-4 text-foreground leading-none">R$ {todayTotal.toFixed(2).replace('.', ',')}</div>
          
          <div className="flex items-center text-primary text-sm sm:text-lg font-medium mb-8 bg-primary/5 w-fit px-4 py-2 rounded-xl border border-primary/10">
             <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
             {isEditingGoal ? (
               <div className="flex items-center gap-2">
                 <span className="whitespace-nowrap">Meta: R$</span>
                 <input 
                   type="number" 
                   autoFocus
                   value={tempGoal} 
                   onChange={(e) => setTempGoal(e.target.value)} 
                   className="w-20 bg-background text-foreground border border-primary/30 rounded px-1 text-sm outline-none"
                 />
                 <button onClick={async () => {
                   if(updateUserData) {
                     await updateUserData({ dailyGoal: Number(tempGoal) || 0 });
                   }
                   setIsEditingGoal(false);
                 }} className="p-1 hover:bg-primary/20 rounded">
                   <Check size={16} />
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setTempGoal(String(userData?.dailyGoal || 0)); setIsEditingGoal(true); }}>
                 <span className="whitespace-nowrap">Meta do dia: R$ {Number(userData?.dailyGoal || 0).toFixed(2).replace('.', ',')}</span>
                 <Pencil size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
               </div>
             )}
          </div>
          
          <div className="mt-auto">
             <div className="w-full bg-secondary h-3 rounded-full mb-2 overflow-hidden shadow-inner relative">
                <div 
                  className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)] transition-all duration-1000 ease-out absolute left-0 top-0"
                  style={{ width: `${Math.min(100, Number(userData?.dailyGoal) > 0 ? (todayTotal / Number(userData?.dailyGoal)) * 100 : 0)}%` }}
                ></div>
             </div>
             {todayTotal === 0 ? (
               <div className="text-sm text-muted-foreground max-w-md mt-4">Nenhuma venda registrada ainda. Que tal começar agora?</div>
             ) : (
               <div className="text-sm font-medium mt-4">
                 {Number(userData?.dailyGoal) > 0 && todayTotal >= Number(userData?.dailyGoal) 
                   ? <span className="text-primary font-bold">Meta atingida! Parabéns! 🎉</span>
                   : <span className="text-muted-foreground">Faltam R$ {Math.max(0, Number(userData?.dailyGoal || 0) - todayTotal).toFixed(2).replace('.', ',')} para bater a meta.</span>
                 }
               </div>
             )}
          </div>
        </div>
        
        {/* Sub Cards Inteligentes */}
        <div className="grid grid-rows-2 gap-6 z-10 relative">
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col shadow-lg border border-border/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <div className="text-[12px] sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-1 font-medium">Estoque / Serviços</div>
                <div className="text-sm text-foreground/50 italic mb-4">Gerencie seu portfólio</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><PackagePlus size={20}/></div>
            </div>
            <Button variant="secondary" className="mt-auto w-full font-semibold border border-primary/20 text-primary hover:bg-primary/10 relative z-10" onClick={() => setActiveAction('inventory')}>
              Gerenciar Estoque
            </Button>
          </div>
          
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col shadow-lg border border-border/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB800]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <div className="text-[12px] sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-1 font-medium">CRM de Vendas</div>
                <div className="text-sm text-foreground/50 italic mb-4">Acompanhe leads e clientes</div>
              </div>
              <div className="w-10 h-10 bg-[#FFB800]/10 rounded-full flex items-center justify-center text-[#FFB800]"><UserPlus size={20}/></div>
            </div>
            <Button variant="secondary" className="mt-auto w-full font-semibold border border-[#FFB800]/20 text-[#FFB800] hover:bg-[#FFB800]/10 relative z-10" onClick={() => setActiveAction('clients')}>
              Abrir CRM
            </Button>
          </div>
        </div>

      </div>

      {/* BARRA DE AÇÕES INFERIOR REFORMULADA MANTENDO O AUDIO EM DESTAQUE E SCANNER DO OUTRO LADO */}
      <div className="flex flex-row justify-center items-end gap-3 sm:gap-4 w-full mt-8 mb-4 z-10 h-[100px] sm:h-[130px]">
        <button onClick={() => setActiveAction('scanner')} className="flex-1 max-w-[160px] h-[80px] sm:h-[100px] rounded-2xl sm:rounded-3xl bg-card text-foreground border border-border flex flex-col items-center justify-center gap-1 sm:gap-2 font-semibold text-[13px] sm:text-[14px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/50 shadow-md active:scale-95 text-center leading-tight">
          <Camera size={20} strokeWidth={2.5} className="text-foreground/70" /> Registrar <br/>por Scanner
        </button>
        
        {/* BIG CENTER AUDIO BUTTON */}
        <button onClick={() => setActiveAction('audio')} className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center gap-1 sm:gap-2 font-bold text-[14px] sm:text-[16px] cursor-pointer transition-all hover:-translate-y-2 shadow-[0_4px_20px_rgba(0,255,102,0.4)] hover:shadow-[0_8px_40px_rgba(0,255,102,0.6)] active:scale-95 mb-4 sm:mb-6 text-center leading-tight">
          <Mic size={36} strokeWidth={2.5} className="sm:w-[48px] sm:h-[48px]" /> Registrar Venda<br/>por Áudio
        </button>

        <button onClick={() => setActiveAction('reports')} className="flex-1 max-w-[160px] h-[80px] sm:h-[100px] rounded-2xl sm:rounded-3xl bg-card text-foreground border border-border flex flex-col items-center justify-center gap-1 sm:gap-2 font-semibold text-[13px] sm:text-[16px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/50 shadow-md active:scale-95 text-center leading-tight">
          <BarChart3 size={20} strokeWidth={2.5} className="text-foreground/70" /> Relatórios
        </button>
      </div>
    </div>
  );
}
