import React, { useEffect } from "react";

export const Search = ({ nodes, onOk, onClose, onCancel }) => {
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
    <div className="h-full flex flex-col rounded-2xl p-1 box-border overflow-hidden">
      <div className="h-12 p-3 box-border">
        
      </div>
      <div className="flex-1 overflow-y-auto"></div>
    </div>
  );
};
