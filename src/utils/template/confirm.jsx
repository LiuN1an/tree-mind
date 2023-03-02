import React, { useEffect, useRef } from "react";

export const Confirm = ({
  onClose,
  onCancel,
  onOk,
  text = "Your idea will be collected in the directory",
}) => {
  const refer = useRef(null);

  useEffect(() => {
    const dom = refer.current;
    if (dom) {
      let isPrevent = false;
      const handleKeyDown = async (event) => {
        console.log(event, event.key);
        if (!isPrevent) {
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            isPrevent = true;
            if (await onOk?.()) {
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
      dom.addEventListener("keydown", handleKeyDown);
      return () => {
        dom.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [onClose, refer.current]);

  return (
    <div className="h-full flex flex-col rounded-2xl p-1" ref={refer}>
      <div className="flex-1 flex items-center justify-center select-none font-bold p-3">
        {text}
      </div>
      <div className="p-3 h-12 flex items-center justify-end gap-2">
        <button
          className="btn btn-ghost text-black"
          onClick={async () => {
            await onCancel?.();
            onClose?.();
          }}
        >
          Cancel
        </button>
        <button
          className="btn btn-ghost text-black btn-active"
          onClick={async () => {
            if (await onOk?.()) {
              onClose?.();
            }
          }}
        >
          Ok
        </button>
      </div>
    </div>
  );
};
