import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, BarChart3, TrendingUp, PackagePlus, UserPlus, X, Phone, StopCircle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Dashboard({ userData, user, logout }: any) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  // Modais Suspensos
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  // Estados de Estoque
  const [invName, setInvName] = useState('');
  const [invSummary, setInvSummary] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invPrice, setInvPrice] = useState('');

  // Estados de Cliente
  const [cliName, setCliName] = useState('');
  const [cliSocial, setCliSocial] = useState('');
  const [cliWhatsapp, setCliWhatsapp] = useState('');
  const [cliItem, setCliItem] = useState('');

  // Referências para Mídia (Câmera e Áudio)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Efeito da Câmera (Inicia automaticamente ao abrir 'photo')
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeAction === 'photo' && !photoData) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Erro ao acessar câmera:", err);
          alert("Permissão de câmera negada ou dispositivo não encontrado.");
        });
    }
    return () => {
      // Limpar os recursos ao desmontar ou mudar de tela
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [activeAction, photoData]);

  // Função Tirar Foto
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
      }
    }
  };

  // 2. Funções de Áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("Áudio gravado com sucesso! Tamanho:", audioBlob.size);
        // Aqui via de regra já mandaríamos pra nossa IA processar
        alert("Áudio captado com sucesso! Vamos analisar e registrar a venda (Integração IA em breve)");
        setActiveAction(null);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro no microfone:", err);
      alert("Permissão de microfone negada ou não encontrado.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Pára os tracks de uso
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  // Handler WhatsApp
  const handleCallClient = () => {
    const number = cliWhatsapp.replace(/\D/g, '');
    if(!number) {
       alert("Digite um número de WhatsApp válido.");
       return;
    }
    const text = `Olá ${cliSocial || cliName}, tudo bem? Viemos falar sobre ${cliItem}.`;
    window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, '_blank');
    setShowClientModal(false);
    setCliName(''); setCliSocial(''); setCliWhatsapp(''); setCliItem('');
  };

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

  if (activeAction === 'photo') {
     return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center justify-center">
         <h2 className="text-2xl font-bold mb-6">Capturar Recibo ou Produto</h2>
         <div className="w-full max-w-sm aspect-[3/4] bg-secondary border-2 border-border rounded-[24px] flex items-center justify-center mb-8 overflow-hidden relative shadow-lg">
            {!photoData ? (
               <video ref={videoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />
            ) : (
               <img src={photoData} alt="Foto tirada" className="absolute w-full h-full object-cover" />
            )}
            {/* Oculto: fallback canvas para capturar o frame */}
            <canvas ref={canvasRef} className="hidden" />
         </div>
         
         <div className="flex gap-4">
           {photoData ? (
             <>
               <Button variant="outline" size="lg" className="h-14 px-6" onClick={() => setPhotoData(null)}>
                 <RefreshCcw className="w-5 h-5 mr-2" /> Tentar Novamente
               </Button>
               <Button size="lg" className="h-14 px-8 shadow-[0_0_15px_rgba(0,255,102,0.4)]" onClick={() => {
                 alert("Foto pronta! O Gemini fará a extração dos dados."); 
                 setActiveAction(null); 
                 setPhotoData(null);
               }}>
                 Extrair Dados
               </Button>
             </>
           ) : (
             <>
               <Button variant="outline" size="lg" className="h-14 px-6" onClick={() => setActiveAction(null)}>Voltar</Button>
               <Button size="lg" className="h-14 px-8 shadow-[0_0_15px_rgba(0,255,102,0.4)]" onClick={takePhoto}>
                 <Camera className="mr-2" /> Tirar Foto
               </Button>
             </>
           )}
         </div>
      </div>
    );
  }

  if (activeAction === 'reports') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center justify-center">
         <div className="w-24 h-24 bg-card rounded-[24px] flex items-center justify-center mb-8 border border-border/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <BarChart3 className="text-primary w-12 h-12" />
         </div>
         <h2 className="text-3xl font-bold mb-3 tracking-tight">Relatórios Detalhados</h2>
         <p className="text-muted-foreground mb-10 text-center max-w-md text-lg">Em breve um dashboard completo com gráficos de faturamento, vendas consolidadas e controle financeiro.</p>
         <Button variant="outline" size="lg" className="h-14 px-8" onClick={() => setActiveAction(null)}>Voltar ao Início</Button>
      </div>
    );
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
          <div className="text-5xl sm:text-7xl lg:text-[84px] font-bold tracking-tight mb-4 text-foreground leading-none">R$ 0,00</div>
          
          <div className="flex items-center text-primary text-sm sm:text-lg font-medium mb-8 bg-primary/5 w-fit px-4 py-2 rounded-xl border border-primary/10">
             <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
             Meta do dia: R$ {userData?.dailyGoal ? (userData.dailyGoal).toFixed(2) : '0.00'}
          </div>
          
          <div className="mt-auto">
             <div className="w-full bg-secondary h-3 rounded-full mb-2 overflow-hidden shadow-inner">
                <div className="bg-primary h-full w-[2%] rounded-full shadow-[0_0_10px_rgba(0,255,102,0.5)]"></div>
             </div>
            <div className="text-sm text-muted-foreground max-w-md mt-4">Nenhuma venda registrada ainda. Que tal começar agora?</div>
          </div>
        </div>
        
        {/* Sub Cards Inteligentes */}
        <div className="grid grid-rows-2 gap-6">
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col shadow-lg border border-border/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[12px] sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-1 font-medium">Estoque / Serviços</div>
                <div className="text-sm text-foreground/50 italic mb-4">Gerencie seu portfólio</div>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary"><PackagePlus size={20}/></div>
            </div>
            <Button variant="secondary" className="mt-auto w-full font-semibold border border-primary/20 text-primary hover:bg-primary/10" onClick={() => setShowInventoryModal(true)}>
              + Adicionar Novo
            </Button>
          </div>
          
          <div className="bg-card rounded-[24px] p-6 lg:p-8 flex flex-col shadow-lg border border-border/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB800]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[12px] sm:text-[14px] uppercase tracking-[2px] text-muted-foreground mb-1 font-medium">Clientes VIP</div>
                <div className="text-sm text-foreground/50 italic mb-4">Crie contatos rápidos</div>
              </div>
              <div className="w-10 h-10 bg-[#FFB800]/10 rounded-full flex items-center justify-center text-[#FFB800]"><UserPlus size={20}/></div>
            </div>
            <Button variant="secondary" className="mt-auto w-full font-semibold border border-[#FFB800]/20 text-[#FFB800] hover:bg-[#FFB800]/10" onClick={() => setShowClientModal(true)}>
              + Cadastrar Cliente
            </Button>
          </div>
        </div>

      </div>

      {/* BARRA DE AÇÕES INFERIOR */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full mt-8 mb-4 z-10">
        <button onClick={() => setActiveAction('photo')} className="col-span-2 lg:col-span-1 h-[90px] sm:h-[120px] rounded-[20px] sm:rounded-[24px] bg-primary text-primary-foreground flex flex-col items-center justify-center gap-2 sm:gap-3 font-bold text-[14px] sm:text-[18px] cursor-pointer transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,255,102,0.25)] hover:shadow-[0_8px_30px_rgba(0,255,102,0.4)] active:scale-95 active:shadow-none">
          <Camera size={24} strokeWidth={2.5} /> Lançar por Foto
        </button>
        <button onClick={() => setActiveAction('audio')} className="h-[90px] sm:h-[120px] rounded-[20px] sm:rounded-[24px] bg-card text-foreground border border-border flex flex-col items-center justify-center gap-2 sm:gap-3 font-semibold text-[14px] sm:text-[18px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/50 shadow-md active:scale-95">
          <div className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] rounded-full bg-secondary/80 flex items-center justify-center text-primary border border-primary/20"><Mic size={20} strokeWidth={2.5} /></div>
          Registrar via Áudio
        </button>
        <button onClick={() => setActiveAction('reports')} className="h-[90px] sm:h-[120px] rounded-[20px] sm:rounded-[24px] bg-card text-foreground border border-border flex flex-col items-center justify-center gap-2 sm:gap-3 font-semibold text-[14px] sm:text-[18px] cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-secondary/50 shadow-md active:scale-95">
          <div className="w-[36px] h-[36px] sm:w-[48px] sm:h-[48px] rounded-full bg-secondary/80 flex items-center justify-center text-foreground/70 border border-border"><BarChart3 size={20} strokeWidth={2.5} /></div>
          Relatórios
        </button>
      </div>

      {/* ====================================================================================================== */}
      {/* MODAL: ADICIONAR ESTOQUE / SERVIÇO */}
      {/* ====================================================================================================== */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-[24px] p-6 sm:p-8 border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowInventoryModal(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground bg-secondary rounded-full p-1"><X size={20}/></button>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3"><PackagePlus className="text-primary"/> Adicionar Item</h3>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nome do Produto ou Serviço</label>
                <Input placeholder="Ex: Camiseta Básica, Consulta..." value={invName} onChange={e => setInvName(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Resumo/Descrição</label>
                <Input placeholder="Cor, tamanho ou detalhes técnicos" value={invSummary} onChange={e => setInvSummary(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Quantidade</label>
                  <Input type="number" placeholder="Ex: 50" value={invQty} onChange={e => setInvQty(e.target.value)} className="h-12 bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Preço (R$)</label>
                  <Input type="number" placeholder="Ex: 89.90" value={invPrice} onChange={e => setInvPrice(e.target.value)} className="h-12 bg-secondary/50 border-border" />
                </div>
              </div>
              <Button size="lg" className="w-full h-12 mt-2 text-lg font-semibold shadow-md" onClick={() => {
                alert("Estoque/Sereviço salvo localmente com sucesso! (Integração DB em breve)");
                setShowInventoryModal(false);
                setInvName(''); setInvSummary(''); setInvQty(''); setInvPrice('');
              }}>
                💾 Salvar Estoque
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================================================== */}
      {/* MODAL: ADICIONAR CLIENTE VIP */}
      {/* ====================================================================================================== */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-[24px] p-6 sm:p-8 border border-[#FFB800]/30 shadow-[0_20px_60px_rgba(255,184,0,0.1)] relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowClientModal(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground bg-secondary rounded-full p-1"><X size={20}/></button>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-[#FFB800]"><UserPlus className="text-[#FFB800]"/> Novo Cliente</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nome Completo</label>
                <Input placeholder="Ex: Maria Silvia de Souza" value={cliName} onChange={e => setCliName(e.target.value)} className="h-12 bg-secondary/50 border-border focus-visible:ring-[#FFB800]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nome Social / Como gosta de ser chamado</label>
                <Input placeholder="Ex: Mary" value={cliSocial} onChange={e => setCliSocial(e.target.value)} className="h-12 bg-secondary/50 border-border focus-visible:ring-[#FFB800]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nº WhatsApp</label>
                <Input placeholder="Ex: (11) 98888-7777" type="tel" value={cliWhatsapp} onChange={e => setCliWhatsapp(e.target.value)} className="h-12 bg-secondary/50 border-border focus-visible:ring-[#FFB800]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Item/Serviço Contratado Mais Frequente</label>
                <Input placeholder="Ex: Unhas de Gel, Bolo de Pote" value={cliItem} onChange={e => setCliItem(e.target.value)} className="h-12 bg-secondary/50 border-border focus-visible:ring-[#FFB800]" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Button variant="outline" size="lg" className="w-full border-border h-12" onClick={() => {
                  alert("Cliente salvo no sistema!"); 
                  setShowClientModal(false);
                }}>
                  Salvar Apenas
                </Button>
                <Button size="lg" className="w-full h-12 bg-[#FFB800] hover:bg-[#E5A600] text-black font-bold border-0" onClick={handleCallClient}>
                  <Phone className="w-4 h-4 mr-2" /> Salvar & Chamar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
