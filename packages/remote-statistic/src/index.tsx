import React from 'react';
import { createRoot } from 'react-dom/client';
import StatisticApp from './StatisticApp';
import '@guesty/shared/src/styles.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<StatisticApp />);
}