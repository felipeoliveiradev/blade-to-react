import { useState, useEffect } from 'react';
import { bridge } from '../core/Bridge';

export function useBladeForm(formName: string) {
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = bridge.listen('validation', (state) => {
      setIsValid(state.isValid);
      setErrors(state.errors || {});
    });

    return unsubscribe;
  }, [formName]);

  return { isValid, errors };
}
