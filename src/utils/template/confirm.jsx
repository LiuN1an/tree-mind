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
      const handleKeyDown = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "Enter") {
          if (await onOk?.()) {
            onClose?.();
          }
        }
        if (event.key === "Escape") {
          await onCancel?.();
          onClose?.();
        }
      };
      document.body.addEventListener("keydown", handleKeyDown, true);
      return () => {
        document.body.removeEventListener("keydown", handleKeyDown, true);
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
