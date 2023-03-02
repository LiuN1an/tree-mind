import React, { useEffect, useRef, useState } from "react";
import { Input } from "@chakra-ui/react";

export const Search = ({ nodes, onOk, onClose, onCancel }) => {
  const [input, setInput] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const dom = containerRef?.current;
    let isPrevent = false;
    const handleKeyDown = async (event) => {
      if (!isPrevent) {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          isPrevent = true;
          if (await onOk?.(input)) {
            onClose?.();
          }
          isPrevent = false;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          isPrevent = true;
          await onCancel?.();
          isPrevent = false;
          onClose?.();
        }
      }
    };
    dom?.addEventListener("keydown", handleKeyDown);
    return () => {
      dom?.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, containerRef.current, input]);

  return (
    <div
      className="h-full flex flex-col rounded-2xl p-1 box-border overflow-hidden"
      ref={containerRef}
    >
      <div className="h-12 p-3 box-border">
        <Input
          placeholder="请输入思维节点描述"
          value={input}
          autoFocus
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto"></div>
    </div>
  );
};
