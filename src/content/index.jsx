import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import styles from "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

if (typeof init === "undefined") {
  const init = () => {
    const app = document.createElement("div");
    app.id = "_tree_idea";
    document.body.appendChild(app);
    const root = document.getElementById("_tree_idea");

    const shadow = root.attachShadow({ mode: "open" });
    const styleTag = document.createElement("style");
    styleTag.textContent = styles.toString();
    shadow.appendChild(styleTag);

    const container = document.createElement("div");
    container.id = "_tree_idea_shadow";
    shadow.appendChild(container);

    const myCache = createCache({
      container: shadow,
      key: "mainapplication",
    });
    createRoot(container).render(
      <CacheProvider value={myCache}>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </CacheProvider>
    );
  };

  init();
}
