import { useState, useEffect } from 'react';
import { bridge } from '../core/Bridge';

export function useBlade<T = any>(key?: string) {
  const [value, setValue] = useState<T>(() => {
    if (!key) return bridge.get() as T;
    return bridge.get(key) as T;
  });

  useEffect(() => {
    if (key) {
      return bridge.listen(key, setValue);
    }
  }, [key]);

  const setter = (newValue: T) => {
    if (key) {
      bridge.set(key, newValue);
    } else {
      console.warn('[BladeReact] Cannot set value without a key');
    }
  };

  return [value, setter] as const;
}