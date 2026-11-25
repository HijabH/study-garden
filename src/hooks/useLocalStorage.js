import { useEffect, useState } from 'react';

// Storage can be missing or full (private mode, embedded previews), so every access is guarded.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved === null ? initialValue : JSON.parse(saved);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* the app keeps working without saving */
    }
  }, [key, value]);

  return [value, setValue];
}
