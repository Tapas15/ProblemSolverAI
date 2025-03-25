import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeApp as initCapacitor } from './lib/capacitor';

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Capacitor features
  initCapacitor()
    .then(() => {
      console.log('Capacitor initialized successfully');
    })
    .catch(error => {
      console.error('Failed to initialize Capacitor:', error);
    });
});

createRoot(document.getElementById("root")!).render(<App />);
