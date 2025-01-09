// examples/basic/CardComponent.tsx
import React                             from 'react';
import {  useBladeSlots } from '../../';

interface CardProps {
  title?: string;
  slots?: Record<string, string>;
}

export function CardComponent({ title, slots = {} }: CardProps) {
  const { hasSlot, renderSlot } = useBladeSlots(slots);
  
  return (
    <div className="card">
      {/* Header com Slot */}
      {hasSlot('header') ? (
        renderSlot('header')
      ) : (
        <div className="card-header">{title}</div>
      )}
      
      {/* Content */}
      <div className="card-body">
        {renderSlot('default')}
      </div>
      
      {/* Footer com Slot */}
      {hasSlot('footer') && (
        <div className="card-footer">
          {renderSlot('footer')}
        </div>
      )}
    </div>
  );
}