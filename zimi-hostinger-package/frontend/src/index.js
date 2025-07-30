import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ZIMI PWA: Service Worker registered successfully:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              if (confirm('Nueva versión disponible. ¿Desea actualizar?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.log('ZIMI PWA: Service Worker registration failed:', error);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('ZIMI PWA: Install prompt triggered');
  e.preventDefault();
  deferredPrompt = e;
  showInstallPrompt();
});

function showInstallPrompt() {
  // Create install prompt UI
  const installPrompt = document.createElement('div');
  installPrompt.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="https://drzerquera.com/wp-content/uploads/2024/02/ZIMI.png" 
             style="width: 40px; height: 40px; border-radius: 8px;" />
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">Instalar ZIMI App</div>
          <div style="font-size: 14px; opacity: 0.9;">Acceso rápido desde su pantalla de inicio</div>
        </div>
        <button id="install-btn" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        ">Instalar</button>
        <button id="dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
        ">×</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installPrompt);
  
  // Install button click
  document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('ZIMI PWA: Install outcome:', outcome);
      deferredPrompt = null;
    }
    document.body.removeChild(installPrompt);
  });
  
  // Dismiss button click
  document.getElementById('dismiss-btn').addEventListener('click', () => {
    document.body.removeChild(installPrompt);
    deferredPrompt = null;
  });
  
  // Auto dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(installPrompt)) {
      document.body.removeChild(installPrompt);
    }
  }, 10000);
}

// Handle app installation
window.addEventListener('appinstalled', (evt) => {
  console.log('ZIMI PWA: App was installed successfully');
  // You can track this event for analytics
});
