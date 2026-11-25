import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { PantheonProvider } from "./state/store";
import "./styles/global.css";
import "./styles/floor.css";

// BASE_URL ends in a slash. React Router basename must not.
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <PantheonProvider>
        <App />
      </PantheonProvider>
    </BrowserRouter>
  </StrictMode>,
);
