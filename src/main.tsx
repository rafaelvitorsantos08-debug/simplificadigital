import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Captura global imediata do evento de instalação (PWA) para não perder o prompt precoce do navegador
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredPrompt = e;
  // Despacha um evento personalizado para notificar dinamicamente os componentes React ativos
  window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: e }));
});

// Registro do Service Worker para suporte PWA e instalação funcional
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PWA Service Worker registrado com sucesso:', registration.scope);
      })
      .catch((error) => {
        console.error('Erro ao registrar o PWA Service Worker:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
