import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// ブラウザ互換性チェック
const isCompatible = () => {
  try {
    eval('async () => {}');
    return true;
  } catch {
    return false;
  }
};

if (!isCompatible()) {
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>ブラウザの互換性エラー</h1>
      <p>お使いのブラウザは、このアプリケーションをサポートしていません。</p>
      <p>最新のGoogle Chrome、Firefox、またはSafariをご使用ください。</p>
    </div>
  `;
} else {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}