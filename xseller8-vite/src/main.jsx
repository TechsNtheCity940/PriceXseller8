import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";  // Ensure the extension is .jsx
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
