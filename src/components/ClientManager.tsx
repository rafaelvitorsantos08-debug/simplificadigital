import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, X, Plus, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ClientManager({ user, onBack }: any) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [item, setItem] = useState('');

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
    setShowModal(true);
  };

  const openEditModal = (client: any) => {
    setEditingId(client.id);
    setName(client.name); setSocialName(client.socialName); setWhatsapp(client.whatsapp); setItem(client.item);
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
        const text = `Olá ${socialName || name}, tudo bem? Viemos falar sobre ${item}.`;
        window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, '_blank');
      }

      setShowModal(false);
      fetchClients();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o cliente.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir cadastro deste cliente?")) {
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
    const text = `Olá ${client.socialName || client.name}, tudo bem? Viemos falar sobre ${client.item}.`;
    window.open(`https://wa.me/55${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3"><UserPlus className="text-[#FFB800]"/> Clientes VIP</h2>
        <Button variant="outline" onClick={onBack}>Voltar</Button>
      </div>

      <div className="w-full bg-card rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Todos os seus contatos salvos.</p>
          <Button onClick={openAddModal} className="bg-[#FFB800] text-black hover:bg-[#E5A600]"><Plus className="w-4 h-4 mr-2" /> Cadastrar Cliente</Button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center"><p className="text-muted-foreground">Carregando...</p></div>
        ) : clients.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.<br/>Clique em "Cadastrar Cliente".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 content-start">
            {clients.map(client => (
              <div key={client.id} className="bg-secondary/30 rounded-xl p-5 border border-border flex flex-col group relative">
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(client)} className="p-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary hover:text-white transition-colors"><Edit2 size={14}/></button>
                  <button onClick={() => handleDelete(client.id)} className="p-1.5 bg-destructive/20 text-destructive rounded-md hover:bg-destructive hover:text-white transition-colors"><Trash2 size={14}/></button>
                </div>
                
                <h3 className="font-bold text-lg mb-1 max-w-[80%] truncate">{client.socialName || client.name}</h3>
                <p className="text-muted-foreground text-xs mb-3">{client.name}</p>
                
                <div className="text-sm bg-secondary p-2 rounded mb-4">
                  <span className="text-muted-foreground block text-xs">Interesse/Compra:</span>
                  {client.item || "Não especificado"}
                </div>

                <Button variant="secondary" className="mt-auto border-[#FFB800]/30 text-[#FFB800] hover:bg-[#FFB800]/10 w-full font-medium" onClick={() => handleCall(client)}>
                   <Phone className="w-4 h-4 mr-2" /> Chamar WhatsApp
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-[24px] p-6 sm:p-8 border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground bg-secondary rounded-full p-1"><X size={20}/></button>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3"><UserPlus className="text-[#FFB800]"/> {editingId ? "Editar Cliente" : "Novo Cliente"}</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nome Completo</label>
                <Input placeholder="Nome na Identidade..." value={name} onChange={e => setName(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nome Social / Como gosta de ser chamado</label>
                <Input placeholder="Apelido ou nome social..." value={socialName} onChange={e => setSocialName(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">WhatsApp (Apenas Números)</label>
                <Input placeholder="(11) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Qual Produto / Serviço Contratado?</label>
                <Input placeholder="Consultoria VIP 6 Meses" value={item} onChange={e => setItem(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Button variant="outline" size="lg" className="w-full border-border h-12" onClick={() => handleSave(false)}>
                  Salvar Apenas
                </Button>
                <Button size="lg" className="w-full h-12 bg-[#FFB800] hover:bg-[#E5A600] text-black font-bold border-0" onClick={() => handleSave(true)}>
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
