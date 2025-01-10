import React from 'react';
import { Root } from 'react-dom/client';
// types.ts

export interface BladeAPI {
  register(name: string, component: React.ComponentType<any>): void;
  mount(name: string, element: HTMLElement): void;
  unmount(name: string): void;
  get(key?: string): any;
  set(key: string, value: any): void;
  listen(key: string, callback: (value: any) => void): () => void;
  emit(event: string, data?: any): void;
  integrate(name: string, library: any, config?: any): void;
  init(config: BridgeConfig): void;
  debug(): void;
}

export interface BridgeConfig {
  debug?: boolean;
  autoInit?: boolean;
  errorHandler?: (error: Error) => void;
}

export interface SlotProps {
  [key: string]: string;
}

export interface ComponentConfig {
  component: React.ComponentType<any>;
  root?: Root;
}

export interface RootManagerInterface {
  getOrCreateRoot(container: Element): Root;
  unmountRoot(root: Root): void;
  isAlreadyMounted(id: string): boolean;
  setMounted(id: string, mounted: boolean): void;
  isObserverActive(): boolean;
  setObserverActive(active: boolean): void;
  debug(): void;
}

export interface ComponentRegistryInterface {
  register(name: string, component: React.ComponentType<any>): void;
  has(name: string): boolean;
  get(name: string): React.ComponentType<any>;
  getAll(): Map<string, ComponentConfig>;
  debug(): void;
}


declare global {
  interface Window {
    blade: any;
    [key: string]: any;
  }
}