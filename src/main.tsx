import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAdBannerGuardian } from './utils/adManager';

// Stop any advertisement banners from displaying on page
initAdBannerGuardian();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
