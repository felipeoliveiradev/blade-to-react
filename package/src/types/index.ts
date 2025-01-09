export interface BladeState {
  [key: string]: any;
}

export interface BridgeConfig {
  debug?: boolean;
  autoInit?: boolean;
  errorHandler?(error: Error): void;
}

export interface ComponentConfig {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  slots?: Record<string, string>;
  root?: any;
  instance?: any;
}

export interface ComponentChild {
  type: string;
  props: Record<string, any>;
  slots?: SlotProps;
  children?: ComponentChild[];
}

// Interface para a API global do blade
export interface BladeAPI {
  get(key?: string): any;
  set(key: string, value: any): void;
  listen(key: string, callback: (value: any) => void): () => void;
  emit(event: string, data?: any): void;
  mount: (name: string, element: HTMLElement) => void;
  unmount(name: string): void;
  register(name: string, component: React.ComponentType<any>): void;
  integrate(name: string, library: any, config?: any): void;
  debug(): void;
  init(config: BridgeConfig): void;
}

// Interface para libs externas
export interface ExternalLibrary {
  [key: string]: any;
}

export interface SlotProps {
  [key: string]: string;
}

declare global {
  interface Window {
    blade: BladeAPI;
    [key: string]: any; // Permite qualquer propriedade global
  }
}