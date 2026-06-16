import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import LightsFestApp from './LightsFestApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LightsFestApp />
  </StrictMode>
);
