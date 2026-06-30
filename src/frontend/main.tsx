import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

console.log('[React] main.tsx loaded');
console.log('[React] React version:', React.version);
console.log('[React] Looking for root element...');

const rootElement = document.getElementById('root');
console.log('[React] Root element found:', !!rootElement);
console.log('[React] Root element:', rootElement);

if (!rootElement) {
  console.error('[React] ERROR: Root element #root not found!');
  console.error('[React] Document body:', document.body);
  console.error('[React] Document HTML:', document.documentElement.outerHTML);
  throw new Error('Root element not found');
}

console.log('[React] Creating root and rendering App...');
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[React] ✓ App rendered successfully');
} catch (error) {
  console.error('[React] ✗ Failed to render app:', error);
  throw error;
}
