// examples/integration/FormWithLibrary.tsx
import React, { useEffect }         from 'react';
import { bridge, useBlade } from '../..';


export function FormWithLibrary() {
  const [formState, setFormState] = useBlade('formState');

  useEffect(() => {
    // Exemplo de integração com qualquer lib
    bridge.integrate('myLibrary', window.MyLibrary, {
      onValidate: (isValid: boolean) => {
        setFormState({ isValid });
        bridge.emit('form:validated', { isValid });
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