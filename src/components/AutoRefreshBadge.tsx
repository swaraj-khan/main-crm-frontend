import { useEffect } from "react";

export const useAutoRefresh = (
  callback: () => void,
  intervalSeconds: number
) => {
  useEffect(() => {
    callback();
    const id = setInterval(callback, intervalSeconds * 1000);
    return () => clearInterval(id);
  }, []);
};
