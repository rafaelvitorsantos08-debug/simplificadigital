import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, X, Plus, Phone, CalendarClock, MessageCircle, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ClientManager({ user, onBack }: any) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // CRM Form
  const [name, setName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [item, setItem] = useState(''); // Interesse
  const [status, setStatus] = useState('Lead'); // Lead, Negociacao, Cliente, Pos-Venda
  const [followUp, setFollowUp] = useState(''); // Data
  const [notes, setNotes] = useState(''); // Anotações p/ personalizacao

  const STATUS_OPTIONS = ['Lead', 'Negociação', 'Cliente', 'Pós-Venda', 'Perdido'];

  const fetchClients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'clients'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user.uid]);

  const openAddModal = () => {
    setEditingId(null);
    setName(''); setSocialName(''); setWhatsapp(''); setItem('');
    setStatus('Lead'); setFollowUp(''); setNotes('');
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setEditingId(client.id);
    setName(client.name); setSocialName(client.socialName || ''); setWhatsapp(client.whatsapp); 
    setItem(client.item || ''); setStatus(client.status || 'Lead'); 
    setFollowUp(client.followUp || ''); setNotes(client.notes || '');
    setShowModal(true);
  };

  const handleSave = async (andCall = false) => {
    if (!name || !whatsapp) return alert("Nome e WhatsApp são obrigatórios.");
    const payload = {
      userId: user.uid,
      name,
      socialName,
      whatsapp,
      item,
      status,
      followUp,
      notes,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'clients', editingId), payload);
      } else {
        await addDoc(collection(db, 'clients'), { ...payload, createdAt: serverTimestamp() });
      }
      
      if (andCall) {
        const number = whatsapp.replace(/\D/g, '');
        const text = `Olá ${socialName || name}, viemos falar sobre ${item}.`;
        window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, '_blank');
      }

      setShowModal(false);
      fetchClients();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o CRM.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir cadastro deste contato no CRM?")) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        fetchClients();
      } catch (e) {
        console.error(e);
        alert("Erro ao excluir.");
      }
    }
  };

  const handleCall = (client: any) => {
    const number = client.whatsapp.replace(/\D/g, '');
    const text = `Olá ${client.socialName || client.name}! Aqui é referente sobre ${client.item || 'seu interesse'}.`;
    window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const filteredClients = filterStatus === 'all' 
    ? clients 
    : clients.filter(c => (c.status || 'Lead') === filterStatus);

  const getStatusColor = (st: string) => {
    switch(st) {
      case 'Lead': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Negociação': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Cliente': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Pós-Venda': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Perdido': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-secondary text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-7xl mx-auto items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3"><BarChart3 className="text-[#FFB800]"/> CRM de Vendas</h2>
          <p className="text-muted-foreground mt-2 hidden sm:block">Centralização de Dados, Gestão de Funil e Personalização do Cliente.</p>
        </div>
        <Button variant="outline" onClick={onBack}>Voltar</Button>
      </div>

      <div className="w-full bg-card rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
             <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === 'all' ? 'bg-primary text-black border-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-secondary'}`}>Todos</button>
             {STATUS_OPTIONS.map(opt => (
               <button key={opt} onClick={() => setFilterStatus(opt)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === opt ? 'bg-primary text-black border-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-secondary'}`}>{opt}</button>
             ))}
          </div>

          <Button onClick={openAddModal} className="bg-[#FFB800] text-black hover:bg-[#E5A600] shrink-0 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Novo Contato
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center"><p className="text-muted-foreground">Carregando CRM...</p></div>
        ) : filteredClients.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-muted-foreground">Nenhum cliente neste estágio do funil.<br/>Clique em "Novo Contato" para expandir seu CRM.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
            {filteredClients.map(client => (
              <div key={client.id} className="bg-secondary/20 rounded-xl p-5 border border-border flex flex-col group relative hover:border-[#FFB800]/50 transition-colors">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(client)} className="p-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary hover:text-white transition-colors"><Edit2 size={14}/></button>
                  <button onClick={() => handleDelete(client.id)} className="p-1.5 bg-destructive/20 text-destructive rounded-md hover:bg-destructive hover:text-white transition-colors"><Trash2 size={14}/></button>
                </div>
                
                <div className="mb-3">
                   <div className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-2 ${getStatusColor(client.status || 'Lead')}`}>
                     {client.status || 'Lead'}
                   </div>
                   <h3 className="font-bold text-lg leading-tight truncate pr-14">{client.socialName || client.name}</h3>
                   <p className="text-muted-foreground text-[11px] truncate">{client.name}</p>
                </div>
                
                <div className="text-sm bg-background border border-border p-3 rounded-lg mb-4 flex-1 shadow-inner">
                  {client.item && (
                    <div className="mb-2 pb-2 border-b border-border/50">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold mb-0.5"><MessageCircle size={10} className="inline mr-1"/> Interesse:</span>
                      <span className="font-medium text-xs truncate block">{client.item}</span>
                    </div>
                  )}
                  {client.followUp && (
                     <div className="mb-2 pb-2 border-b border-border/50">
                       <span className="text-muted-foreground block text-[10px] uppercase font-semibold mb-0.5"><CalendarClock size={10} className="inline mr-1"/> Follow-up (Agendamento):</span>
                       <span className="font-medium text-xs text-[#FFB800]">{client.followUp}</span>
                     </div>
                  )}
                  {client.notes && (
                     <div>
                       <span className="text-muted-foreground block text-[10px] uppercase font-semibold mb-0.5">Anotações (Personalização):</span>
                       <span className="text-xs text-foreground/80 line-clamp-2 italic">"{client.notes}"</span>
                     </div>
                  )}
                </div>

                <Button variant="secondary" className="mt-auto border-[#FFB800]/30 bg-[#FFB800]/5 text-[#FFB800] hover:bg-[#FFB800]/15 w-full font-medium" onClick={() => handleCall(client)}>
                   <Phone className="w-4 h-4 mr-2" /> Chamar WhatsApp
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-xl rounded-[24px] p-6 sm:p-8 border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground bg-secondary rounded-full p-1"><X size={20}/></button>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3"><UserPlus className="text-[#FFB800]"/> {editingId ? "Editar Ficha no CRM" : "Nova Ficha CRM"}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block text-muted-foreground">Estágio do Funil (Status)</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => setStatus(opt)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${status === opt ? getStatusColor(opt) : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Nome Completo</label>
                <Input placeholder="Identidade do cliente..." value={name} onChange={e => setName(e.target.value)} className="bg-secondary/30 border-border" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Apelido / Social</label>
                <Input placeholder="Como gosta de ser chamado..." value={socialName} onChange={e => setSocialName(e.target.value)} className="bg-secondary/30 border-border" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">WhatsApp (Apenas Números)</label>
                <Input placeholder="DDD+Número" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="bg-secondary/30 border-border" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Produto/Serviço (Interesse)</label>
                <Input placeholder="Ex: Curso VIP" value={item} onChange={e => setItem(e.target.value)} className="bg-secondary/30 border-border" />
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground flex items-center gap-1"><CalendarClock size={14}/> Lembrete de Follow-up (Automação Comercial)</label>
                <Input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} className="bg-secondary/30 border-border w-full" />
                <p className="text-[10px] text-muted-foreground mt-1">Defina quando fará um novo acionamento ou retorno pro cliente.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground flex items-center gap-1"><MessageCircle size={14}/> Anotações (Personalização/Dores)</label>
                <textarea 
                  rows={3}
                  placeholder="Quais são os desejos e dores do cliente? Historico de contato..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full bg-secondary/30 border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" 
                />
              </div>
              
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="lg" className="w-full border-border h-12" onClick={() => handleSave(false)}>
                  Apenas Salvar
                </Button>
                <Button size="lg" className="w-full h-12 bg-[#FFB800] hover:bg-[#E5A600] text-black font-bold border-0 shadow-[0_0_15px_rgba(255,184,0,0.3)]" onClick={() => handleSave(true)}>
                  <Phone className="w-4 h-4 mr-2" /> Salvar & Contatar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
