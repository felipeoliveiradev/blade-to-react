import { useEffect } from 'react';
import { bridge } from '../core/Bridge';

export function useBladeEvent(event: string, callback: (data: any) => void) {
  useEffect(() => {
    const unsubscribe = bridge.listen(event, callback);
    return () => unsubscribe();
  }, [event, callback]);
}