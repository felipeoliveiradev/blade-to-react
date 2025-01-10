import React, { useMemo } from 'react';

export function useBladeSlots(slots: Record<string, string> = {}) {
  return useMemo(() => ({
    hasSlot: (name: string) => Boolean(slots[name]),
    renderSlot: (name: string) => slots[name] ? (
        <div dangerouslySetInnerHTML={{ __html: slots[name] || '' }} />
    ) : null
  }), [slots]);
}