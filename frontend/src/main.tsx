// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <AppRoutes />
  // </StrictMode>
);
