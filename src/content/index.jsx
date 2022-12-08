import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./index.css";

if (typeof init === "undefined") {
  const init = () => {
    const app = document.createElement("div");
    app.id = "_tree_idea";
    document.body.appendChild(app);
    const root = document.getElementById("_tree_idea");

    const shadow = root.attachShadow({ mode: "open" });
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", chrome.runtime.getURL("./content.css"));
    shadow.appendChild(link);

    const container = document.createElement("div");
    shadow.appendChild(container);
    createRoot(container).render(<App />);
  };

  init();
}
