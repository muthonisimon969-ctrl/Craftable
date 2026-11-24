import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

const root = createRoot(document.getElementById('root')!);

if (window.location.pathname === '/ir-showcase') {
  import('./pages/IrShowcasePage').then(({ default: IrShowcasePage }) => {
    root.render(
      <StrictMode>
        <IrShowcasePage />
      </StrictMode>
    );
  });
} else {
  import('./App').then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}
