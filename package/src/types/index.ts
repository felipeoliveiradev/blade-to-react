export interface BladeState {
  [key: string]: any;
}

export interface BridgeConfig {
  debug?: boolean;
  autoInit?: boolean;
}

export interface ComponentConfig {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  slots?: Record<string, string>;
  root?: any;
  instance?: any;
}

// Interface para a API global do blade
export interface BladeAPI {
  get(): Record<string, any>;
  get(key: string): any;
  set: (key: string, value: any) => void;
  listen: (key: string, callback: (value: any) => void) => () => void;
  emit: (event: string, data?: any) => void;
  mount: (name: string, props?: any) => void;
  unmount: (name: string) => void;
  register: (name: string, component: any) => void;
  integrate: (name: string, library: any, config?: any) => void;
  debug: () => void;
  init: (config: any) => void;
}

// Interface para libs externas
export interface ExternalLibrary {
  [key: string]: any;
}

declare global {
  interface Window {
    blade: BladeAPI;
    [key: string]: any; // Permite qualquer propriedade global
  }
}