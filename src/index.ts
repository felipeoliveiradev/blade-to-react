export { bridge } from './core/Bridge';
export { useBlade, useBladeForm, useBladeSlots } from './hooks';

export function BladeComponent(name: string) {
    return function(component: any) {
        window.blade?.register(name, component);
        return component;
    };
}

export * from './types';
