import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface ManualSaleProps {
  onBack: () => void;
  onSave: (saleData: any) => Promise<void>;
  inventoryItems: any[];
}

export default function ManualSale({ onBack, onSave, inventoryItems }: ManualSaleProps) {
  const [productName, setProductName] = useState('');
  const [value, setValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [cashGiven, setCashGiven] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('manual');
  const [isProcessing, setIsProcessing] = useState(false);

  const saleValue = Number(value) || 0;
  const cashValue = Number(cashGiven) || 0;
  const troco = Math.max(0, cashValue - saleValue);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    if (id === 'manual') {
       // leave name/value as is
    } else {
       const item = inventoryItems.find(i => i.id === id);
       if (item) {
         setProductName(item.name);
         setValue(String(item.price || 0));
       }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || saleValue <= 0) {
      alert("Preencha nome do produto e um valor válido.");
      return;
    }
    
    setIsProcessing(true);
    let targetId = selectedProductId === 'manual' ? null : selectedProductId;
    
    // Attempt match by name if manual
    if (!targetId) {
      const match = inventoryItems.find(i => i.name.toLowerCase() === productName.toLowerCase());
      if (match) targetId = match.id;
    }

    try {
      await onSave({
        produto: productName,
        valor: saleValue,
        pagamento: paymentMethod,
        matchedProductId: targetId // used by parent to deduct inventory if it logic allows
      });
    } catch (e) {
       console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 sm:p-10 max-w-lg mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Venda Manual
        </h2>
      </header>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-[32px] p-6 shadow-xl flex flex-col gap-5">
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Vincular Produto (Opcional)</label>
          <select 
            value={selectedProductId} 
            onChange={e => handleProductSelect(e.target.value)}
            className="w-full h-14 bg-background border border-border rounded-xl px-4 text-sm font-medium focus:outline-none focus:border-primary transition-colors text-foreground"
          >
            <option value="manual">Item Avulso (Não abater estoque)</option>
            {inventoryItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} - R$ {Number(item.price||0).toFixed(2)} (Estoque: {item.qty})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nome do Produto/Serviço</label>
          <input 
            required 
            type="text" 
            value={productName}
            onChange={e => setProductName(e.target.value)}
            className="w-full h-14 bg-background border border-border rounded-xl px-4 font-medium focus:outline-none focus:border-primary transition-colors"
            placeholder="Ex: Camiseta Preta G"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Valor (R$)</label>
          <input 
            required 
            type="number" step="0.01" min="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full h-14 bg-background text-primary border border-border rounded-xl px-4 font-black text-xl focus:outline-none focus:border-primary transition-colors"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Forma de Pagamento</label>
          <select 
            value={paymentMethod} 
            onChange={e => setPaymentMethod(e.target.value)}
            className="w-full h-14 bg-background border border-border rounded-xl px-4 font-medium focus:outline-none focus:border-primary transition-colors"
          >
            <option value="Dinheiro">Dinheiro</option>
            <option value="Pix">Pix</option>
            <option value="Cartão de Crédito">Cartão de Crédito</option>
            <option value="Cartão de Débito">Cartão de Débito</option>
          </select>
        </div>

        {paymentMethod === 'Dinheiro' && (
          <div className="bg-secondary/30 p-4 rounded-2xl border border-border space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Valor Recebido do Cliente (R$)</label>
              <input 
                type="number" step="0.01" min={value || 0}
                value={cashGiven}
                onChange={e => setCashGiven(e.target.value)}
                className="w-full h-12 bg-background border border-border rounded-xl px-4 font-medium focus:outline-none focus:border-primary transition-colors"
                placeholder="Ex: 50.00"
              />
            </div>
            {cashGiven && cashValue >= saleValue && (
               <div className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/20">
                 <span className="font-semibold text-primary">Troco a devolver:</span>
                 <span className="font-black text-xl text-primary">R$ {troco.toFixed(2).replace('.', ',')}</span>
               </div>
            )}
          </div>
        )}

        <Button type="submit" disabled={isProcessing} className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 mt-2">
          {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmar Venda"}
        </Button>
      </form>
    </div>
  );
}
