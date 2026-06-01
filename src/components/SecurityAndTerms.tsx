import { useState, useEffect } from 'react';
import { ShieldCheck, Info, FileText, X, Cookie, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export default function SecurityAndTerms() {
  const [showCookiesBanner, setShowCookiesBanner] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cdc'>('privacy');

  useEffect(() => {
    // Verifica se já aceitou cookies
    const cookiesAccepted = localStorage.getItem('simplifica_cookies_accepted');
    if (!cookiesAccepted) {
      setShowCookiesBanner(true);
    }

    // Configuração de segurança de console silencioso/defensivo contra tentativas de F12 maliciosas (XSS)
    const handleConsoleWarning = () => {
      if (process.env.NODE_ENV === 'production' || !window.location.hostname.includes('localhost')) {
        // Silencia logs de debug no console em produção e exibe aviso de segurança profissional
        console.clear();
        console.log(
          '%c🛑 ATENÇÃO: ÁREA SEGURA PARA PROPRIETÁRIOS',
          'color: #ff0055; font-size: 24px; font-weight: bold; font-family: sans-serif;'
        );
        console.log(
          '%cEste console de ferramentas de desenvolvedor é uma área restrita. Inserir qualquer script ou código desconhecido aqui pode dar acesso a hackers aos seus dados e vendas. Nunca execute comandos fornecidos por terceiros.',
          'color: #ffffff; font-size: 14px; font-family: sans-serif; line-height: 1.5; background: #222; padding: 10px; border-radius: 8px;'
        );
      }
    };
    
    // Pequeno delay para garantir inicialização limpa antes de rodar segurança do console
    const timer = setTimeout(handleConsoleWarning, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('simplifica_cookies_accepted', 'true');
    setShowCookiesBanner(false);
  };

  return (
    <>
      {/* BANNER DE COOKIES (Focado em LGPD) */}
      {showCookiesBanner && (
        <div 
          id="lgpd-cookie-banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-card/95 backdrop-blur-md border border-border rounded-2xl p-5 shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-primary/15 text-primary rounded-xl shrink-0">
              <Cookie className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-foreground">Privacidade & Cookies (LGPD)</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Nós usamos cookies para salvar suas configurações de IA (chaves de API) e manter sua sessão do Google conectada de forma segura. Ao continuar, você concorda com nossos termos.
              </p>
              <div className="flex gap-2 mt-4 justify-end">
                <button 
                  onClick={() => {
                    setActiveTab('privacy');
                    setShowLegalModal(true);
                  }}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground underline px-2 py-1 transition-colors"
                >
                  Saber mais
                </button>
                <Button 
                  size="sm" 
                  onClick={handleAcceptCookies}
                  className="h-8 text-xs font-bold shadow-[0_0_10px_rgba(0,255,102,0.3)]"
                >
                  Aceitar e Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINK DISCRETO PARA LEIS E SEGURANÇA NO RODAPÉ */}
      <div className="w-full py-4 text-center border-t border-border/20 bg-background/5 p-4 shrink-0 mt-auto">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Simplifica Digital. Todos os direitos reservados.</span>
          <span className="text-border/60">|</span>
          <button 
            onClick={() => {
              setActiveTab('privacy');
              setShowLegalModal(true);
            }} 
            className="hover:text-primary transition-colors underline decoration-dotted"
          >
            Política de Privacidade (LGPD)
          </button>
          <span className="text-border/60">•</span>
          <button 
            onClick={() => {
              setActiveTab('terms');
              setShowLegalModal(true);
            }} 
            className="hover:text-primary transition-colors underline decoration-dotted"
          >
            Termos de Uso
          </button>
          <span className="text-border/60">•</span>
          <button 
            onClick={() => {
              setActiveTab('cdc');
              setShowLegalModal(true);
            }} 
            className="hover:text-primary font-bold text-primary/80 transition-colors underline decoration-dotted"
          >
            Arrependimento / Reembolso (CDC - 7 dias)
          </button>
        </div>
      </div>

      {/* MODAL JURÍDICO & TÉCNICO COMPLETO */}
      {showLegalModal && (
        <div 
          id="legal-compliance-modal"
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-205"
        >
          <div className="bg-card border border-border w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Termos, Privacidade e Segurança Jurídica</h3>
                  <p className="text-xs text-muted-foreground">Simplifica Digital — Em conformidade com as leis federais brasileiras</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLegalModal(false)}
                className="p-1 px-2.5 text-muted-foreground hover:text-foreground bg-secondary rounded-full text-sm font-semibold transition-colors"
              >
                <X className="w-4 h-4 inline" /> Sair
              </button>
            </div>

            {/* Abas */}
            <div className="flex border-b border-border bg-secondary/15 overflow-x-auto text-sm shrink-0">
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 py-3 px-4 min-w-[120px] text-center font-semibold transition-colors border-b-2 hover:bg-secondary/20 ${activeTab === 'privacy' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
              >
                1. Privacidade & LGPD
              </button>
              <button 
                onClick={() => setActiveTab('terms')}
                className={`flex-1 py-3 px-4 min-w-[120px] text-center font-semibold transition-colors border-b-2 hover:bg-secondary/20 ${activeTab === 'terms' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
              >
                2. Termos de Uso
              </button>
              <button 
                onClick={() => setActiveTab('cdc')}
                className={`flex-1 py-3 px-4 min-w-[120px] text-center font-semibold transition-colors border-b-2 hover:bg-secondary/20 ${activeTab === 'cdc' ? 'border-[#ff9900] text-[#ff9900] bg-[#ff9900]/5' : 'border-transparent text-muted-foreground'}`}
              >
                3. Direito Reembolso (CDC)
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto flex-1 text-sm text-foreground/90 space-y-4 leading-relaxed">
              {activeTab === 'privacy' && (
                <div id="tab-lgpd-privacy" className="space-y-4">
                  <div className="flex gap-2 items-center text-primary font-bold text-base mb-1">
                    <Info className="w-5 h-5" /> Política de Privacidade e Consentimento LGPD
                  </div>
                  <p>
                    O <strong>Simplifica Digital</strong> respeita integralmente a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei nº 13.709/2018</strong>. Nós garantimos a transparência, privacidade e livre acesso dos usuários sobre quaisquer dados pessoais retidos em nossa plataforma.
                  </p>
                  
                  <h4 className="font-bold text-foreground">Como Coletamos e Guardamos os Seus Dados?</h4>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs">
                    <li><strong>Dados cadastrais:</strong> Seu nome, foto e e-mail de administrador são vinculados à plataforma por meio da ferramenta oficial do Google OAuth de login unificado.</li>
                    <li><strong>Estoque e CRM de Vendas:</strong> Todas as criações de produtos, listas de preços, nomes de clientes e contatos gravados no CRM são criptografados em trânsito e guardados de maneira isolada no banco de dados Cloud Firestore do Firebase. Os termos de visualização requerem login verificado por Token Autoritativo Seguro para impedir que qualquer outro usuário ou terceiros acessem suas informações empresariais.</li>
                    <li><strong>Imagens e Fotos de Produtos:</strong> As imagens que você anexa aos produtos do estoque são convertidas para arquivos comprimidos locais com o consentimento do navegador para garantir desempenho rápido e maior economia de tráfego, eliminando servidores intermediários vulneráveis.</li>
                    <li><strong>Transparência total:</strong> O titular pode, a qualquer momento, excluir todos os dados do banco excluindo suas vendas diretamente nas ferramentas da plataforma.</li>
                  </ul>

                  <p className="border-l-2 border-primary pl-3 text-xs text-muted-foreground italic">
                    Aviso Legal: Não vendemos nem compartilhamos listas de contatos, nomes de produtos, relatórios de receitas ou dados de seus clientes no CRM com parceiros de marketing ou empresas terceiras. O banco de dados é de propriedade exclusiva e individual do usuário.
                  </p>
                </div>
              )}

              {activeTab === 'terms' && (
                <div id="tab-terms-of-use" className="space-y-4">
                  <div className="flex gap-2 items-center text-primary font-bold text-base mb-1">
                    <FileText className="w-5 h-5" /> Termos de Uso e Contrato de Licença de Software
                  </div>
                  <p>
                    Ao utilizar o Simplifica Digital, você concorda com as condições descritas no presente Termos de Uso. Esta plataforma destina-se ao gerenciamento de ordens de vendas de microempreendedores, pequenas empresas ou profissionais liberais.
                  </p>

                  <h4 className="font-bold text-foreground">Regras e Responsabilidades:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs">
                    <li><strong>Chave de Inteligência Artificial:</strong> O uso de inteligência artificial de leitura de áudio/foto processadas é alimentado pela API do Google Gemini. O usuário é estimulado a fornecer sua própria chave privada para garantir gratuidade total e evitar vazamentos ou interrupções comerciais no aplicativo.</li>
                    <li><strong>Uso Responsável:</strong> Você concorda em não usar o WhatsApp CRM integrado para prática nociva de disparo em massa de mensagens indesejadas (SPAM). O envio de mensagens deve ser estritamente consensual conforme preconizado pelas políticas do WhatsApp e LGPD.</li>
                    <li><strong>Isenção de Erros de IA:</strong> O processamento inteligente de imagem e áudio tenta extrair de forma fidedigna os dados do produto, porém o app apresenta uma tela de confirmação rápida antes da consolidação no banco. É obrigação do lojista inspecionar a exatidão dos dados antes de confirmar.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'cdc' && (
                <div id="tab-cdc-refund" className="space-y-4 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
                  <div className="flex gap-2 items-center text-[#ff9900] font-extrabold text-base mb-1">
                    <Info className="w-5 h-5" /> Direito de Arrependimento de 7 Dias (Art. 49 do CDC)
                  </div>
                  <p className="text-foreground">
                    O <strong>Código de Defesa do Consumidor brasileiro (CDC - Lei Federal nº 8.078/1990, Artigo 49)</strong> assegura aos consumidores brasileiros um período de reflexão e o direito incontestável de desistência da aquisição contratada de forma remota (pela internet ou aplicativo).
                  </p>

                  <div className="bg-card p-4 rounded-xl border border-border">
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-1 text-xs">
                      🛡️ Garantia de Reembolso Integral de 100% de Valores:
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Caso o usuário assine ou adquira um pacote premium de automação, espaço de nuvem estendido ou recursos pagos de inteligência artificial do Simplifica Digital, ele conta com o <strong>prazo legal de 7 (sete) dias corridos</strong> para se arrepender das assinaturas, sem precisar de qualquer justificativa técnica ou burocrática.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      A manifestação de cancelamento dentro deste período acarreta no <strong>estorno imediato e devolução integral de 100%</strong> de quaisquer valores pagos pelas transações, de acordo com as diretrizes do regulamento de comércio eletrônico no Brasil.
                    </p>
                  </div>

                  <h4 className="font-bold text-foreground text-xs">Como solicitar o reembolso?</h4>
                  <p className="text-xs text-muted-foreground">
                    Para reaver o valor investido se por qualquer motivo desistir do uso do app, o contratante pode enviar um e-mail para <strong>suporte@simplificadigital.online</strong> de maneira simplificada com o assunto "Estorno CDC / Reembolso" solicitando a exclusão de sua assinatura e a repatriação financeira. O processamento é efetuado sem taxas administrativas.
                  </p>
                </div>
              )}

            </div>

            {/* Footer do Modal */}
            <div className="p-4 bg-secondary/20 border-t border-border flex justify-end shrink-0">
              <Button onClick={() => setShowLegalModal(false)} size="lg" className="px-8 font-bold h-12 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                Concluído
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
