import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }: { onScan: (text: string) => void, onClose: () => void }) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Need a unique ID for the container
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      /* verbose= */ false
    );

    let isScanning = true;
    scannerRef.current.render(
      (decodedText) => {
        if (isScanning) {
          isScanning = false;
          scannerRef.current?.clear().then(() => {
             onScan(decodedText);
          });
        }
      },
      (error) => {
        // Ignorar erros normais de "não encontrou QR Code no quadro"
      }
    );

    return () => {
      isScanning = false;
      scannerRef.current?.clear().catch(e => console.error("Error clearing scanner", e));
    };
  }, [onScan]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-full bg-black">
       <div className="w-full max-w-sm mb-4">
         <div id="qr-reader" className="w-full h-auto bg-black rounded-xl overflow-hidden border-2 border-primary"></div>
       </div>
       <button onClick={onClose} className="px-6 py-3 bg-card text-foreground rounded-full border border-border mt-4">
         Cancelar
       </button>
    </div>
  );
}
