import ReactDOM from 'react-dom/client';

export class RootManager {
    private roots: Map<string, ReactDOM.Root> = new Map();
    private mountedComponents: Set<string> = new Set();
    private observerActive = false;

    public getOrCreateRoot(element: HTMLElement): ReactDOM.Root {
        const key = element.id || `root-${Math.random().toString(36).substring(2, 15)}`;
        if (!this.roots.has(key)) {
            const root = ReactDOM.createRoot(element);
            this.roots.set(key, root);
        }
        return this.roots.get(key) as ReactDOM.Root;
    }

    public unmountRoot(root: ReactDOM.Root): void {
        root.unmount();
        this.roots.clear();
    }

    public isAlreadyMounted(uniqueId: string): boolean {
        return this.mountedComponents.has(uniqueId);
    }

    public setMounted(uniqueId: string, mounted: boolean): void {
        if (mounted) {
            console.log(mounted)
            this.mountedComponents.add(uniqueId);
        } else {
            console.log(mounted)
            this.mountedComponents.delete(uniqueId);
        }
    }

    public isObserverActive(): boolean {
        return this.observerActive;
    }

    public setObserverActive(active: boolean): void {
        this.observerActive = active;
    }

    public debug(): void {
        console.log('Mounted Components:', Array.from(this.mountedComponents));
    }
}