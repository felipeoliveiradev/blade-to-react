import { ComponentType } from 'react';
interface ComponentEntry {
    component: ComponentType<any>;
    instance?: any;
}

export class ComponentRegistry {
    private components: Record<string, ComponentEntry> = {};

    public register(name: string, component: ComponentType<any>): void {
        const key = name.toString().toLowerCase();
        this.components[key] = { component };

        // Log para debug
        console.log(`Registered component: ${key}`);
        console.log('Current components:', Object.keys(this.components));
    }

    public get(name: string): ComponentType<any> | undefined {
        const key = name.toLowerCase();
        const entry = this.components[key];

        // Log para debug
        console.log(`Getting component: ${key}`);
        console.log(`Component exists: ${!!entry}`);

        return entry?.component;
    }

    public getAll(): Array<[string, ComponentEntry]> {
        return Object.entries(this.components);
    }

    public debug(): void {
        console.log('=== Registry Debug ===');
        console.log('All registered components:', Object.keys(this.components));
        console.log('Registry state:', JSON.stringify(this.components, (key, value) => {
            if (typeof value === 'function') return 'ComponentFunction';
            return value;
        }, 2));
    }

    public has(name: string): boolean {
        return !!this.components[name.toLowerCase()];
    }

    public remove(name: string): void {
        const key = name.toLowerCase();
        delete this.components[key];
    }
}