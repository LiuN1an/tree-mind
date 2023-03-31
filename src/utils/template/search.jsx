import React, { useEffect, useRef, useState } from "react";
import { Input } from "@chakra-ui/react";

export const Search = ({ nodes, onOk, onClose, onCancel, value = "" }) => {
  const [input, setInput] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    const dom = containerRef?.current;
    const handleKeyDown = async (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        if (await onOk?.(input)) {
          onClose?.();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        await onCancel?.();
        onClose?.();
      } else {
        // TODO: 这里缺一个可以阻断上层所有冲突键位的统一机制
        const { key, ctrlKey, keyCode } = event;
        if (
          (ctrlKey && key === "q") ||
          keyCode === 32 ||
          keyCode === 8 ||
          keyCode === 46 ||
          keyCode === 38 ||
          keyCode === 40 ||
          keyCode === 37 ||
          keyCode === 39
        ) {
          event.stopPropagation();
        }
      }
    };

    dom?.addEventListener("keydown", handleKeyDown, true);
    return () => {
      dom?.removeEventListener("keydown", handleKeyDown, true);
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
          defaultValue={input}
          autoFocus
          onChange={(event) => {
            setInput(event.target.value);
          }}
          onBlur={() => {
            onClose?.();
          }}
        />
      </div>
      <div className="flex-1 overflow-y-auto"></div>
    </div>
  );
};
