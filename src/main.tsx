import './polyfills.ts';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
  } catch (err) {
    console.error('[GsmScope Mount Error]', err);
    const snapshot = document.getElementById('seo-crawler-snapshot');
    if (snapshot) {
      snapshot.style.display = 'block';
      snapshot.className = 'p-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-100 font-sans';
    }
  }
}


