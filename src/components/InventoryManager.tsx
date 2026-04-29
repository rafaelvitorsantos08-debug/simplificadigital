import { useState, useEffect, useRef } from 'react';
import { PackagePlus, Edit2, Trash2, X, Plus, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { db, storage } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function InventoryManager({ user, onBack }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getParsedValue = (val: any) => {
    if (!val) return 0;
    const num = Number(String(val).replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const parsedPriceAnalysis = getParsedValue(price);
  const parsedCostAnalysis = getParsedValue(costPrice);
  const marginAnalysis = parsedCostAnalysis > 0 
    ? ((parsedPriceAnalysis - parsedCostAnalysis) / parsedCostAnalysis) * 100 
    : 100;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'inventory'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user.uid]);

  const openAddModal = () => {
    setEditingId(null);
    setName(''); setSummary(''); setQty(''); setPrice(''); setCostPrice(''); setPhotoUrl('');
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setName(item.name); setSummary(item.summary); setQty(item.qty); setPrice(item.price); setCostPrice(item.costPrice || ''); setPhotoUrl(item.photoUrl || '');
    setShowModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingPhoto(true);
    try {
      const extension = file.name.split('.').pop();
      const fileName = `inventory/${user.uid}_${Date.now()}.${extension}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setPhotoUrl(downloadURL);
    } catch (err: any) {
      console.error("Erro ao fazer upload da foto:", err);
      alert("Ocorreu um erro ao enviar a imagem. Tente novamente.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!name || !price) return alert("Nome e Preço são obrigatórios.");

    const parsedQty = getParsedValue(qty);
    const parsedPrice = getParsedValue(price);
    const parsedCost = getParsedValue(costPrice);

    const payload = {
      userId: user.uid,
      name,
      summary,
      qty: parsedQty,
      price: parsedPrice,
      costPrice: parsedCost,
      photoUrl,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'inventory', editingId), payload);
      } else {
        await addDoc(collection(db, 'inventory'), { ...payload, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      fetchItems();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar o item.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
        fetchItems();
      } catch (e) {
        console.error(e);
        alert("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-6xl mx-auto items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3"><PackagePlus className="text-primary"/> Gerenciar Estoque</h2>
        <Button variant="outline" onClick={onBack}>Voltar</Button>
      </div>

      <div className="w-full bg-card rounded-2xl p-6 shadow-lg border border-border/50 relative overflow-hidden flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">Todos os seus serviços e produtos.</p>
          <Button onClick={openAddModal} className="shadow-[0_0_10px_rgba(0,255,102,0.3)]"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center"><p className="text-muted-foreground">Carregando...</p></div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-muted-foreground">Nenhum item adicionado ainda.<br/>Clique em "Adicionar" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 content-start">
            {items.map(item => (
              <div key={item.id} className="bg-secondary/30 rounded-xl p-4 border border-border flex flex-col group relative">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button onClick={() => openEditModal(item)} className="p-1.5 bg-primary/20 text-primary rounded-md hover:bg-primary hover:text-white transition-colors backdrop-blur-sm"><Edit2 size={14}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-destructive/20 text-destructive rounded-md hover:bg-destructive hover:text-white transition-colors backdrop-blur-sm"><Trash2 size={14}/></button>
                </div>
                {item.photoUrl && (
                  <div className="w-full h-32 mb-3 rounded-lg overflow-hidden relative">
                     <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-bold text-lg max-w-[85%]">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-3 h-10 overflow-hidden">{item.summary || "Sem descrição"}</p>
                <div className="flex justify-between mt-auto pt-3 border-t border-border items-end">
                  <span className="font-mono text-sm bg-secondary px-2 py-1 rounded h-fit">Qtd: {item.qty}</span>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">
                      Custo: R$ {Number(item.costPrice || 0).toFixed(2)}
                    </span>
                    {Number(item.price || 0) > 0 && (
                      <span className="text-[10px] text-primary block font-bold mb-1 px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20 inline-block">
                        Lucro: R$ {(Number(item.price || 0) - Number(item.costPrice || 0)).toFixed(2)} ({Number(item.costPrice || 0) > 0 ? (((Number(item.price || 0) - Number(item.costPrice || 0)) / Number(item.costPrice || 0)) * 100).toFixed(1) : 100}%)
                      </span>
                    )}
                    <span className="font-bold text-primary block text-lg leading-none mt-1">R$ {Number(item.price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-[24px] p-6 sm:p-8 border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground bg-secondary rounded-full p-1"><X size={20}/></button>
            <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3"><PackagePlus className="text-primary"/> {editingId ? "Editar Item" : "Adicionar Item"}</h3>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-center mb-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                />
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-32 bg-secondary/50 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors relative overflow-hidden"
                >
                  {isUploadingPhoto ? (
                     <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : photoUrl ? (
                     <>
                       <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-medium">
                          Alterar Foto
                       </div>
                     </>
                  ) : (
                     <>
                        <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium text-muted-foreground">Adicionar Foto do Produto</span>
                     </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nome do Produto ou Serviço</label>
                <Input placeholder="Ex: Camiseta Básica, Consulta..." value={name} onChange={e => setName(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Resumo/Descrição</label>
                <Input placeholder="Cor, tamanho ou detalhes técnicos" value={summary} onChange={e => setSummary(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Preço de Custo (R$)</label>
                  <Input type="number" placeholder="Ex: 40.00" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="h-12 bg-secondary/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Preço final de Venda (R$)</label>
                  <Input type="number" placeholder="Ex: 89.90" value={price} onChange={e => setPrice(e.target.value)} className="h-12 bg-secondary/50 border-border" />
                </div>
              </div>
              {parsedPriceAnalysis > 0 && (
                 <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex justify-between items-center text-sm">
                   <div className="text-muted-foreground">
                      Análise de Preço:
                   </div>
                   <div className="text-right">
                      <span className="text-primary font-bold block">
                         Lucro: R$ {(parsedPriceAnalysis - parsedCostAnalysis).toFixed(2)}
                      </span>
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                        Margem: {marginAnalysis.toFixed(1)}%
                      </span>
                   </div>
                 </div>
              )}
              <div>
                 <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Quantidade</label>
                 <Input type="number" placeholder="Ex: 50" value={qty} onChange={e => setQty(e.target.value)} className="h-12 bg-secondary/50 border-border" />
              </div>
              <Button size="lg" className="w-full h-12 mt-2 text-lg font-semibold shadow-md" onClick={handleSave}>
                💾 Salvar Estoque
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
