// examples/advanced/SharedStateExample.tsx
import React                        from 'react';
import { BladeComponent, useBlade } from '@blade-to-react/core';

// Componente que modifica o estado
@BladeComponent('state-modifier')
export function StateModifier() {
  const [sharedData, setSharedData] = useBlade('sharedData');
  
  return (
    <div>
      <input 
        value={sharedData?.text || ''}
        onChange={e => setSharedData({ 
          ...sharedData, 
          text: e.target.value 
        })}
      />
    </div>
  );
}

// Componente que exibe o estado
@BladeComponent('state-viewer')
export function StateViewer() {
  const [sharedData] = useBlade('sharedData');
  
  return (
    <div>
      <h3>Dados Compartilhados:</h3>
      <pre>{JSON.stringify(sharedData, null, 2)}</pre>
    </div>
  );
}