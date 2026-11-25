import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { PantheonProvider } from "./state/store";
import "./styles/global.css";
import "./styles/floor.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PantheonProvider>
        <App />
      </PantheonProvider>
    </BrowserRouter>
  </StrictMode>,
);
