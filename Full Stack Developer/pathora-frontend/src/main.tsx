import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './styles/globals.css';
import App from "./App.tsx";

const storedTheme = localStorage.getItem("pathora-theme");
if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
}

const root = createRoot(document.getElementById("root")!);
root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
