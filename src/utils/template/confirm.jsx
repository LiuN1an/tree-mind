import React, { useEffect } from "react";

export const Confirm = ({ onClose, onCancel, onOk }) => {
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.key === "Enter") {
        if (await onOk?.()) {
          onClose?.();
        }
      }
      if (event.key === "Escape") {
        await onCancel?.();
        onClose?.();
      }
      event.preventDefault();
      event.stopPropagation();
    };
    document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="h-full flex flex-col rounded-2xl p-1">
      <div className="flex-1 flex items-center justify-center select-none font-bold p-3">
        Your idea will be collected in the directory
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
