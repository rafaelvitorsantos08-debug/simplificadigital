import React, { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone, Compass, ArrowRight, Share, PlusSquare, X } from 'lucide-react';
import { Button } from './ui/button';

interface InstallAppProps {
  variant?: 'button' | 'banner' | 'icon';
  className?: string;
  onInstalled?: () => void;
}

export default function InstallApp({ variant = 'button', className = '', onInstalled }: InstallAppProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    os: 'unknown',
    browser: 'unknown',
    isMobile: false
  });

  useEffect(() => {
    // Detecta se já está sendo executado em modo standalone (como app instalado)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 1. Verifica se já foi capturado globalmente de forma precoce
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setIsReadyToInstall(true);
    }

    // 2. Escuta se o evento global disparou após o carregamento inicial
    const handleGlobalPromptAvailable = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
        setIsReadyToInstall(true);
      }
    };
    window.addEventListener('pwa-prompt-available', handleGlobalPromptAvailable);

    // Captura o evento nativo de instalação do Chrome/Android/Edge/Windows Windows
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setIsReadyToInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detecta se a instalação foi completada com sucesso
    const handleAppInstalled = () => {
      setIsReadyToInstall(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      setIsStandalone(true);
      if (onInstalled) onInstalled();
      alert('Simplifica instalado com sucesso!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Identificação rica do dispositivo e navegador
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const platform = (navigator as any).userAgentData?.platform || navigator.platform || '';
      
      let os = 'unknown';
      let browser = 'unknown';
      let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

      // Detecção de OS
      if (/iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        os = 'ios';
        isMobile = true;
      } else if (/Android/i.test(ua)) {
        os = 'android';
        isMobile = true;
      } else if (/Windows/i.test(ua)) {
        os = 'windows';
      } else if (/Mac/i.test(ua)) {
        os = 'mac';
      } else if (/Linux/i.test(ua)) {
        os = 'linux';
      }

      // Detecção de Navegador
      if (/SamsungBrowser/i.test(ua)) {
        browser = 'samsung';
      } else if (/FxiOS/i.test(ua) || /Firefox/i.test(ua)) {
        browser = 'firefox';
      } else if (/Edg/i.test(ua)) {
        browser = 'edge';
      } else if (/Chrome/i.test(ua) || /CriOS/i.test(ua)) {
        browser = 'chrome';
      } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        browser = 'safari';
      } else if (/Opera|OPR/i.test(ua)) {
        browser = 'opera';
      }

      setDeviceInfo({ os, browser, isMobile });
    };

    detectDevice();

    return () => {
      window.removeEventListener('pwa-prompt-available', handleGlobalPromptAvailable);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  // Se já estiver rodando como um Aplicativo Instalado (standalone), não há necessidade de incentivo de instalação
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Se o evento nativo beforeinstallprompt estiver disponível, dispara a instalação nativa do Windows/Android
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Escolha do usuário sobre instalação: ${outcome}`);
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsReadyToInstall(false);
          setIsStandalone(true);
        }
      } catch (err) {
        console.error('Erro ao acionar prompt de instalação de PWA:', err);
      }
    } else {
      // Se não houver evento nativo direto, abrimos o modal explicativo e inteligente (ex: iOS, Firefox ou navegadores customizados)
      setShowInstructionsModal(true);
    }
  };

  return (
    <>
      {variant === 'button' && (
        <Button
          id="btn-pwa-install"
          onClick={handleInstallClick}
          className={`flex items-center gap-2 bg-[#00FF66] hover:bg-[#00E55C] text-black font-extrabold px-4 h-10 rounded-xl transition duration-200 shrink-0 text-xs shadow-lg shadow-primary/20 ${className}`}
        >
          <Download className="w-4 h-4 text-black animate-bounce" />
          <span>Instalar Aplicativo</span>
        </Button>
      )}

      {variant === 'banner' && (
        <div 
          onClick={handleInstallClick}
          className={`cursor-pointer bg-card/90 backdrop-blur border border-border hover:border-primary/40 rounded-2xl p-4 flex gap-4 items-center justify-between transition-all duration-300 shadow-xl group ${className}`}
        >
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Simplifica no seu Celular ou PC</h4>
              <p className="text-xs text-muted-foreground">Instale o app e tenha acesso instantâneo, mais rápido e offline.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
        </div>
      )}

      {variant === 'icon' && (
        <button
          onClick={handleInstallClick}
          title="Instalar Aplicativo (PWA)"
          className={`p-2 hover:bg-secondary/40 text-muted-foreground hover:text-primary rounded-xl transition shrink-0 ${className}`}
        >
          <Download className="w-5 h-5 animate-pulse" />
        </button>
      )}

      {/* MODAL INTELIGENTE DE INSTRUÇÕES DE INSTALAÇÃO */}
      {showInstructionsModal && (
        <div id="pwa-install-instructions-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            id="pwa-install-instructions-content"
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button 
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Instalar o Simplifica</h3>
                <p className="text-xs text-muted-foreground">Acesse como um aplicativo nativo diretamente no seu dispositivo.</p>
              </div>
            </div>

            {/* Conteúdo dinâmico com base no dispositivo e navegador */}
            <div className="space-y-6 mb-6">
              
              {deviceInfo.os === 'ios' ? (
                /* INSTRUÇÕES PARA iOS (Safari) */
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs text-muted-foreground mb-4">
                    📢 No iPhone ou iPad, os navegadores não possuem suporte de instalação automatizada por requisitos da Apple. Siga o passo a passo abaixo usando o <strong>Safari</strong>:
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Abra o menu de compartilhamento</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                          Toque no ícone de compartilhar <Share className="w-4 h-4 text-blue-500 inline shrink-0" /> na barra inferior (ou superior no iPad).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Adicione à Tela de Início</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
                          Role a lista de opções para baixo e clique em <span className="font-bold text-foreground inline bg-secondary px-1.5 py-0.5 rounded border border-border">Adicionar à Tela de Início</span> <PlusSquare className="w-4 h-4 text-foreground inline shrink-0" />.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Confirme a criação</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clique em <strong>Adicionar</strong> no canto superior direito. Um ícone do Simplifica aparecerá na sua tela inicial!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : deviceInfo.os === 'android' ? (
                /* INSTRUÇÕES PARA ANDROID CASO FALHE O PROMPT */
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs text-muted-foreground mb-4">
                    Para instalar no Android usando {deviceInfo.browser === 'chrome' ? 'Google Chrome' : 'seu navegador'}:
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Menu do Navegador</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clique nos três pontinhos (menu) no canto superior direito do seu navegador.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Clique em Instalar</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Selecione <strong>"Instalar Aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Confirme e use</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confirme a instalação para criar o atalho nativo na sua gaveta de aplicativos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* INSTRUÇÕES PARA DESKTOP CASO NÃO COMPATÍVEL OU SEM PROMPT */
                <div className="space-y-4">
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs text-muted-foreground mb-4">
                    Para computadores (Windows, Mac ou Linux), o suporte de instalação é garantido no Chrome, Edge ou Brave.
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Procure pelo ícone na barra de endereços</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          No topo do navegador, à direita da barra de endereços, clique no ícone de computador com uma seta para baixo (ou um símbolo de +).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Confirme Instalar</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Clique em <strong>Instalar</strong> no prompt que surgir. O desktop criará um atalho e abrirá o aplicativo de forma standalone imediatamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detecção rápida rodapé do modal */}
              <div className="border-t border-border pt-4 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Dispositivo: {deviceInfo.os.toUpperCase()}</span>
                <span>Navegador: {deviceInfo.browser.toUpperCase()}</span>
              </div>

            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                onClick={() => setShowInstructionsModal(false)}
                className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/95 text-black"
              >
                Entendi
              </Button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
