import { DATA_KEY } from "@/content/model";
import { useEffect, useState } from "react";

export const useTailWindFade = (option) => {
  const [open, setOpen] = useState(option.open || false);
  const [isEnter, setEnter] = useState(false);

  useEffect(() => {
    if (open) {
      setOpen(true);
      setTimeout(() => {
        setEnter(true);
      }, 16);
    } else {
      setEnter(false);
      setTimeout(() => {
        setOpen(false);
      }, 300);
    }
  }, [open]);

  return {
    style: (common, leave, enter) => {
      return [
        "duration-300 transition-all",
        option,
        common,
        open ? "block" : "none",
        isEnter ? enter : leave,
      ];
    },
    open,
    setOpen,
  };
};

export const useDynamicHeight = ({ ref }) => {
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [ref.current]);

  return {
    height,
    setHeight: (num) => {
      setHeight(`${num}px`);
    },
  };
};

export const promiseValue = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export const getStorage = async (key) => {
  const { promise, resolve } = promiseValue();
  chrome.storage.sync.get([key], (result) => {
    resolve(result[key]);
  });
  return promise;
};

export const setStorage = async (saveProps) => {
  const { promise, resolve } = promiseValue();
  chrome.storage.sync.set(saveProps, (result) => {
    resolve();
  });
  return promise;
};

export const getStorageDemo = async (key) => {
  const { promise, resolve } = promiseValue();
  resolve(JSON.parse(window.localStorage.getItem(key) || "{}"));
  return promise;
};

export const setStorageDemo = async (key, props) => {
  const { promise, resolve } = promiseValue();
  window.localStorage.setItem(key, props);
  resolve();
  return promise;
};
