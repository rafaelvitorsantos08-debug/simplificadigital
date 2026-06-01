import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, SwitchCamera, AlertCircle } from 'lucide-react';

export default function QRScanner({ onScan, onClose }: { onScan: (text: string) => void, onClose: () => void }) {
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [activeCameraLabel, setActiveCameraLabel] = useState<string>('Buscando melhor câmera...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // Seleciona a melhor câmera traseira a partir de uma lista
  const findBestRearCamera = (devices: any[]) => {
    // Filtros de câmera traseira por palavras comuns
    const rearDevices = devices.filter(d => {
      const label = d.label.toLowerCase();
      return label.includes('back') || 
             label.includes('traseira') || 
             label.includes('traseir') ||
             label.includes('rear') || 
             label.includes('main') || 
             label.includes('principal') || 
             label.includes('0, facing back') ||
             label.includes('ambiente') ||
             label.includes('padrão');
    });

    if (rearDevices.length === 0) {
      return devices[0] || null;
    }

    // Procura por câmeras traseiras principais/padrão que NÃO sejam ultra-wide ou telephoto
    // Câmeras ultra-wide (0.5x, 0.6x) e telephoto (2x, 3x) de perto não dão foco físico, quebrando leituras de QR Code
    const mainRear = rearDevices.find(d => {
      const label = d.label.toLowerCase();
      return (label.includes('main') || label.includes('principal') || label.includes('standard') || label.includes('padrão') || label.includes('1x')) &&
             !label.includes('ultra') &&
             !label.includes('wide') &&
             !label.includes('tele') &&
             !label.includes('zoom') &&
             !label.includes('macro');
    });

    if (mainRear) return mainRear;

    // Segundo nível de prioridade: evitamos termo wide/macro se houver outra
    const conservativeRear = rearDevices.find(d => {
      const label = d.label.toLowerCase();
      return !label.includes('ultra') && 
             !label.includes('wide') && 
             !label.includes('depth') && 
             !label.includes('macro') && 
             !label.includes('tele');
    });

    return conservativeRear || rearDevices[0];
  };

  const startScanningWithId = async (html5QrCode: Html5Qrcode, cameraId: string) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop();
      }

      await html5QrCode.start(
        cameraId,
        {
          fps: 20, // Aumenta de 10 fps para 20 fps para leitura instantânea e sem lag
          qrbox: (width, height) => {
            const minEdge = Math.min(width, height);
            const qrboxSize = Math.floor(minEdge * 0.7); // 70% da menor dimensão garante bom enquadramento
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0 // Pede rácio quadrado para focalizar melhor em dispositivos móveis
        },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            onScan(decodedText);
          }).catch(e => console.error("Erro ao parar câmera pós leitura", e));
        },
        () => {
          // Ignorar erros normais de scanner ativamente buscando QR Codes frames
        }
      );

      setActiveCameraId(cameraId);
      // Encontra label atual amigável do dispositivo ativo
      const currentCamera = cameras.find(c => c.id === cameraId);
      if (currentCamera) {
         setActiveCameraLabel(currentCamera.label);
      }
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Erro ao iniciar fluxo com ID de câmera:", err);
      setErrorMsg("Não foi possível acessar esta câmera de alta resolução. Tentando modo automático...");
      
      // Fallback para o modo padrão "environment" caso falte suporte do ID direto
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            html5QrCode.stop().then(() => {
              onScan(decodedText);
            }).catch(e => console.error("Erro ao parar câmera", e));
          },
          () => {}
        );
        setActiveCameraLabel("Câmera Traseira Automática");
      } catch (fallbackErr) {
        setErrorMsg("Erro crítico: permissão de câmera negada ou câmera ocupada por outro app.");
      }
    } finally {
      isTransitioningRef.current = false;
    }
  };

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const setupScanner = async () => {
      try {
        // Passo 1: Inicia primeiramente com facingMode nativo "environment". 
        // Isso solicita permissão de câmera corretamente ao usuário de forma padrão.
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            html5QrCode.stop().then(() => {
               onScan(decodedText);
            }).catch(e => console.error("Erro ao parar câmera pós leitura", e));
          },
          () => {}
        );

        setActiveCameraLabel("Buscando melhor câmera de alta precisão...");

        // Passo 2: Agora que a permissão foi concedida por rodar o fluxo, listamos todas as câmeras reais disponíveis.
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);

          const bestRear = findBestRearCamera(devices);
          if (bestRear) {
            // Se identificamos uma câmera mais otimizada/principal do que o padrão aleatório do navegador,
            // reiniciamos o fluxo mirando a excelente câmera
            setActiveCameraLabel(bestRear.label);
            await startScanningWithId(html5QrCode, bestRear.id);
          }
        } else {
          setActiveCameraLabel("Câmera Padrão Ativa");
        }
      } catch (err) {
        console.error("Setup do scanner falhou ou permissão de câmera bloqueada pelo navegador:", err);
        setErrorMsg("Acesso à câmera bloqueado. Por favor, conceda permissão nas configurações de privacidade.");
      }
    };

    setupScanner();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(e => console.error("Erro ao parar scanner no unmount", e));
      }
    };
  }, [onScan]);

  const handleToggleCamera = async () => {
    if (!html5QrCodeRef.current || cameras.length <= 1 || isTransitioningRef.current) return;

    // Encontra índice atual e rotaciona
    const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    if (nextCamera) {
      setActiveCameraLabel(nextCamera.label);
      await startScanningWithId(html5QrCodeRef.current, nextCamera.id);
    }
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

          {/* Toast / Painel indicativo de Qualidade da Câmera Ativa */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur px-3 py-1.5 rounded-full border border-border/80 text-[11px] text-center font-mono max-w-[85%] truncate text-primary uppercase tracking-wide">
             🎥 Ativo: {activeCameraLabel}
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl bg-destructive/10 text-destructive font-semibold border border-destructive/20 mb-4 max-w-xs text-center">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          {cameras.length > 1 && (
            <button 
              onClick={handleToggleCamera} 
              className="flex items-center gap-2 px-6 py-4 bg-secondary text-foreground hover:bg-secondary/80 rounded-2xl font-medium shadow-sm border border-border"
            >
              <SwitchCamera size={20} /> Alternar Câmera ({cameras.length})
            </button>
          )}
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-6 py-4 bg-destructive/10 hover:bg-destructive/15 text-destructive rounded-2xl font-medium"
          >
            Cancelar
          </button>
        </div>
    </div>
  );
}

