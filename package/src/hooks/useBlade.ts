// src/hooks/useBlade.ts
import { useState, useEffect } from 'react';
import { bridge }              from '../core/Bridge';

export function useBlade<T = any>(key?: string) {
  const [value, setValue] = useState<T>(() => {
    // Se não tiver key, retorna todo o estado
    if (!key) return bridge.get() as T;
    // Se tiver key, retorna o valor específico
    return bridge.get(key) as T;
  });

  useEffect(() => {
    // Se não tiver key, não precisa fazer subscribe
    if (!key) return;

    // Subscribe apenas se tiver key
    return bridge.listen(key, setValue);
  }, [key]);

  // Retorna uma função de setter tipada
  const setter = (newValue: T) => {
    if (!key) {
      console.warn('[BladeReact] Cannot set value without a key');
      return;
    }
    bridge.set(key, newValue);
  };

  return [value, setter] as const;
}