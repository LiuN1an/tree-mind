import React from "react";
import { createRoot } from "react-dom/client";
import App from "../app";
import "../mock";
import "../index.css";

const root = document.getElementById("root");
const shadow = root.attachShadow({ mode: "open" });
const link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("href", "content.css");
shadow.appendChild(link);

const container = document.createElement("div");
shadow.appendChild(container);

createRoot(container).render(<App />);
