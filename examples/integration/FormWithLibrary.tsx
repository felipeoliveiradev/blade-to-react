// examples/integration/FormWithLibrary.tsx
import React, { useEffect }         from 'react';
import { BladeComponent, useBlade } from '@blade-to-react/core';

@BladeComponent('form-with-library')
export function FormWithLibrary() {
  const [formState, setFormState] = useBlade('formState');

  useEffect(() => {
    // Exemplo de integração com qualquer lib
    blade.integrate('myLibrary', window.MyLibrary, {
      onValidate: (isValid: boolean) => {
        setFormState({ isValid });
        blade.emit('form:validated', { isValid });
      }
    });
    
    return () => {
      // Cleanup se necessário
    };
  }, []);

  return (
    <form>
      <input type="text" name="name" />
      <input type="email" name="email" />
      
      {formState?.isValid === false && (
        <div className="error">
          Por favor, preencha todos os campos
        </div>
      )}
    </form>
  );
}