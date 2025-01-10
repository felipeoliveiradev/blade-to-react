// examples/basic/SimpleComponent.tsx
import React                        from 'react';
import { BladeComponent, useBlade } from '@blade-to-react/core';

@BladeComponent('simple-component')
export function SimpleComponent() {
  const [count, setCount] = useBlade('count');
  
  return (
    <div>
      <h2>Contador: {count || 0}</h2>
      <button onClick={() => setCount((count || 0) + 1)}>
        Incrementar
      </button>
    </div>
  );
}