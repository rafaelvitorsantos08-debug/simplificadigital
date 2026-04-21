import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, SwitchCamera } from 'lucide-react';

export default function QRScanner({ onScan, onClose }: { onScan: (text: string) => void, onClose: () => void }) {
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: facingMode },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            html5QrCode.stop().then(() => {
               onScan(decodedText);
            }).catch(e => console.error("Error stopping scanner", e));
          },
          (errorMessage) => {
            // Ignorar erros normais durante o escaneamento ativo
          }
        );
      } catch (err) {
        console.error("Error starting scanner", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(e => console.error("Error stopping scanner on unmount", e));
      }
    };
  }, [facingMode, onScan]);

  const toggleCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      await html5QrCodeRef.current.stop();
    }
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full bg-background/95 fixed inset-0 z-50">
       <div className="w-full max-w-sm mb-4 relative">
         <div id="qr-reader" className="w-full h-auto min-h-[300px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-primary/20"></div>
         {/* Mira central no meio do scanner para feedback visual */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-[60%] aspect-square border-2 border-primary/50 rounded-xl relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-xl"></div>
             </div>
         </div>
       </div>

       <div className="flex gap-4 mt-6">
         <button 
           onClick={toggleCamera} 
           className="flex items-center gap-2 px-6 py-4 bg-secondary text-foreground rounded-2xl font-medium shadow-sm border border-border"
         >
           <SwitchCamera size={20} /> Alternar Câmera
         </button>
         <button 
           onClick={onClose} 
           className="flex items-center gap-2 px-6 py-4 bg-destructive/10 text-destructive rounded-2xl font-medium"
         >
           Cancelar
         </button>
       </div>
    </div>
  );
}
