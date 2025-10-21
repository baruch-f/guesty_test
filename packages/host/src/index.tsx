import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';

import '@guesty/shared/dist/styles.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}