import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ToastContainer } from "react-toastify";
import AuthProvider from "./providers/AuthProvider.tsx";
import PresenceProvider from "./providers/PresenceProvider.tsx";
import ThemeProvider from "./providers/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <StrictMode>
        <PresenceProvider>
          <App />
          <ToastContainer />
        </PresenceProvider>
      </StrictMode>
    </AuthProvider>
  </ThemeProvider>
);
