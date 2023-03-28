import React from "react";
import { createRoot, unmountComponentAtNode } from "react-dom/client";
import { ReactDOM } from "react";
import classnames from "classnames";
import { useTailWindFade } from "./hooks";
import { options } from "./template";
import { ChakraProvider } from "@chakra-ui/react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

export const createEscape = (props) => {
  const { render } = props;
  const shadowContainer = document.getElementById("_tree_idea");
  const escapeNode = document.createElement("div");
  escapeNode.id = "_tree_idea_modal";
  shadowContainer.shadowRoot.appendChild(escapeNode);
  let root;
  const onClose = () => {
    root.unmount();
    if (shadowContainer.shadowRoot.contains(escapeNode)) {
      shadowContainer.shadowRoot.removeChild(escapeNode);
    }
  };

  const myCache = createCache({
    container: escapeNode,
    key: "modalapplication",
  });
  const Child = render({ onClose });
  root = createRoot(escapeNode);
  root.render(
    <CacheProvider value={myCache}>
      <ChakraProvider>{Child}</ChakraProvider>
    </CacheProvider>
  );
};

export const CreateCover = ({
  type,
  isCoverClose = true,
  render: Render,
  onClose,
  width,
  height,
  leaveAnimate,
  enterAnimate,
  ...rest
}) => {
  const { style: coverStyle, setOpen: setCoverOpen } = useTailWindFade({
    open: true,
  });
  const { style, setOpen } = useTailWindFade({ open: true });
  return (
    <>
      <div
        className={classnames(
          ...coverStyle(
            "fixed top-0 bottom-0 left-0 right-0 bg-black z-[9999]",
            "opacity-0",
            "opacity-70"
          )
        )}
        onClick={() => {
          if (isCoverClose) {
            setOpen(false);
            setCoverOpen(false);
            setTimeout(() => {
              onClose?.();
            }, 300);
          }
        }}
      />
      <div
        style={{ width: width, height: height }}
        className={classnames(
          ...style(
            "fixed left-1/2 top-1/3 -translate-x-1/2 bg-white rounded-lg z-[9999] ease-scale-cub",
            leaveAnimate,
            enterAnimate
          )
        )}
      >
        {Render && (
          <Render
            {...rest}
            onClose={() => {
              setOpen(false);
              setCoverOpen(false);
              setTimeout(() => {
                onClose?.();
              }, 300);
            }}
            width={width}
            height={height}
          />
        )}
      </div>
    </>
  );
};

export const callModal = (props) => {
  const { type, onClose } = props;
  let close;

  const { component, width, height, leaveAnimate, enterAnimate } =
    options(type);

  createEscape({
    render: ({ onClose: onDestroy }) => {
      close = onDestroy;
      return (
        <CreateCover
          {...props}
          onClose={() => {
            onClose?.();
            onDestroy();
          }}
          render={component}
          width={width}
          height={height}
          leaveAnimate={leaveAnimate}
          enterAnimate={enterAnimate}
        />
      );
    },
  });
  return () => {
    onClose?.();
    close?.();
  };
};
