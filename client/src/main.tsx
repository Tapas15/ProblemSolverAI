import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundaries can't catch errors during rendering in React 18 with Strict Mode
// So we add a global error handler as a safety net
const rootElement = document.getElementById("root");

// Create a container div if the root element doesn't exist
// This is a safeguard against potential DOM issues
if (!rootElement) {
  console.error("Root element not found, creating one");
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
  createRoot(newRoot).render(<App />);
} else {
  createRoot(rootElement).render(<App />);
}
