import React from "react";
import { createRoot } from "react-dom/client";
import App from "../app";
import "../mock";
import "../index.css";

// import styles from "../index.css";
// const styleTag = document.createElement("style");
// styleTag.textContent = styles.toString();

const app = document.createElement("div");
app.id = "_tree_idea";
document.body.appendChild(app);
const root = document.getElementById("_tree_idea");

const shadow = root.attachShadow({ mode: "open" });
const link = document.createElement("link");
link.setAttribute("rel", "stylesheet");
link.setAttribute("type", "text/css; charset=utf-8");
link.setAttribute("href", "content.css");

shadow.appendChild(link);

const container = document.createElement("div");
container.id = "_tree_idea_shadow";
shadow.appendChild(container);
createRoot(container).render(<App />);
