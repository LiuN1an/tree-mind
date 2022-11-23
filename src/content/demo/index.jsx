import React from "react";
import { createRoot } from "react-dom/client";
import App from "../app";
import "../mock";
import "../index.css";

createRoot(document.getElementById("root")).render(<App />);
