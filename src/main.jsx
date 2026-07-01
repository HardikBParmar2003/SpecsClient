import React from 'react';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';
import App from './App.jsx';

import { shopConfig } from './config/shop.js';

import { discoverServer } from './services/api.js';

document.getElementById('app-title').innerText = shopConfig.shopName;

discoverServer().then(() => {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <HashRouter>
              <Toaster position="top-center" />
              <App />
            </HashRouter>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
});
