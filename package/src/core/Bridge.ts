import React from 'react';
import {
  BladeAPI,
  BridgeConfig,
  ComponentChild,
  SlotProps
} from '../types';
import { ComponentRegistry } from './ComponentRegistry';
import { RootManager } from './RootManager';

export class Bridge implements BladeAPI {
  private static instance: Bridge;
  private componentRegistry: ComponentRegistry;
  private rootManager: RootManager;
  private data: Record<string, any> = {};
  private listeners: Map<string, Set<(value: any) => void>> = new Map();
  private config: BridgeConfig = {
    debug: true,
    autoInit: true
  };

  private constructor() {
    this.componentRegistry = new ComponentRegistry();
    this.rootManager = new RootManager();
    this.initGlobal()
  }

  private initGlobal(): void {
    if (typeof window !== 'undefined') {
      window.blade = this;
    }
  }

  private setupAutoMount(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initMount.bind(this));
    } else {
      this.initMount();
    }
  }
  private hasChildComponents(element: HTMLElement): boolean {
    return Array.from(element.children).some(child =>
        child instanceof HTMLElement && child.dataset.bladeReact
    );
  }
  private initMount(): void {
    if (!this.rootManager.isObserverActive()) {
      const observer = new MutationObserver(this.handleMutations.bind(this));
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.rootManager.setObserverActive(true);
      this.mountExistingComponents();
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          this.processElement(node);
        }
      });
    });
  }

  private processElement(element: HTMLElement): void {
    const componentName = element.dataset.bladeReact;
    if (!componentName) return;

    // Se já foi montado, pula
    if (element.hasAttribute('data-mounted')) return;

    // Verifica se o componente existe no registro
    if (!this.componentRegistry.has(componentName)) {
      console.warn(`[BladeReact] Component ${componentName} not registered. Skipping process.`);
      return;
    }

    this.mount(componentName, element);
  }

  private isChildComponent(element: HTMLElement): boolean {
    return !!element.closest('[data-blade-react]:not([data-blade-react="' + element.dataset.bladeReact + '"])');
  }

  private mountExistingComponents(): void {
    document.querySelectorAll('[data-blade-react]:not([data-mounted])').forEach(el => {
      const element = el as HTMLElement;
      const componentName = element.dataset.bladeReact;
      if (!componentName) return;

      if (!this.componentRegistry.has(componentName)) {
        console.warn(`[BladeReact] Component ${componentName} not registered. Skipping existing component mount.`);
        return;
      }

      const uniqueId = element.getAttribute('data-unique-id') || componentName;
      this.mount(componentName, element);
    });
  }

  private buildComponentStructure(element: HTMLElement): { slots: SlotProps, children: ComponentChild[] } {
    const slots: SlotProps = {};
    const children: ComponentChild[] = [];

    const slotContainer: any = element.querySelector('template[data-slot-container]');
    if (slotContainer) {
      slotContainer.content.querySelectorAll('[data-slot]').forEach((slot: any) => {
        if (slot instanceof HTMLElement) {
          const name = slot.getAttribute('data-slot') || 'default';
          slots[name] = slot.innerHTML;
        }
      });
    }

    const childContainer: any = element.querySelector('template[data-child-container]');
    if (childContainer) {
      Array.from(childContainer.content.children).forEach(child => {
        if (child instanceof HTMLElement && child.dataset.bladeReact) {
          children.push({
            type: child.dataset.bladeReact,
            props: this.getElementProps(child),
            ...this.buildComponentStructure(child)
          });
        }
      });
    }

    return { slots, children };
  }


  private getElementProps(element: HTMLElement): Record<string, any> {
    const props: Record<string, any> = {};

    element.getAttributeNames()
        .filter(name => name.startsWith('data-prop-'))
        .forEach(name => {
          const key = name
              .replace('data-prop-', '')
              .split('-')
              .map((part, index) =>
                  index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
              )
              .join('');

          try {
            props[key] = JSON.parse(element.getAttribute(name) || '');
          } catch {
            props[key] = element.getAttribute(name);
          }
        });

    return props;
  }

  public register(name: string, component: React.ComponentType<any>): void {
    this.componentRegistry.register(name, component);
  }


  public mount(name: string, element: HTMLElement): void {
    const uniqueId = element.getAttribute('data-unique-id') || name;

    if (!this.componentRegistry.has(name)) {
      console.warn(`[BladeReact] Component ${name} not registered. Skipping mount.`);
      return;
    }

    if (!this.rootManager.isAlreadyMounted(uniqueId)) {
      try {
        const Component: any = this.componentRegistry.get(name);

        const mountContainer: any = element.querySelector('.react-content');
        if (!mountContainer) {
          console.error(`[BladeReact] No mount container found for ${name}`);
          return;
        }

        const structure = this.buildComponentStructure(element);

        const root = this.rootManager.getOrCreateRoot(mountContainer);
        element.setAttribute('data-mounted', 'true');

        root.render(
            React.createElement(Component, {
              ...this.getElementProps(element),
              ...structure
            })
        );

        console.log(`[BladeReact] Successfully mounted ${name}`);
        this.rootManager.setMounted(uniqueId, true);
      } catch (error) {
        console.error(`[BladeReact] Mount error for ${name}:`, error);
        this.config.errorHandler?.(error as Error);
      }
    }
  }

  public unmount(name: string): void {
    const componentConfigs: any = this.componentRegistry.getAll();
    for (const [componentName, config] of componentConfigs) {
      if (componentName === name && config?.root) {
        this.rootManager.unmountRoot(config.root);
        break;
      }
    }
  }

  public get(key?: string): any {
    return key ? this.data[key] : this.data;
  }

  public set(key: string, value: any): void {
    this.data[key] = value;
    this.notify(key, value);
  }

  public listen(key: string, callback: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  public emit(event: string, data?: any): void {
    this.notify(event, data);
  }

  public integrate(name: string, library: any, config?: any): void {
    console.log(`[BladeReact] Integrating library: ${name}`, library, config);
  }

  public init(config: BridgeConfig): void {
    this.config = { ...this.config, ...config };
    if (this.config.autoInit) {
      this.setupAutoMount();
    }
  }

  public debug(): void {
    console.log('[BladeReact] Debug');
    console.log('Configuration:', this.config);
    this.componentRegistry.debug();
    this.rootManager.debug();
  }

  private notify(key: string, value: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`[BladeReact] Error in listener for ${key}:`, error);
          this.config.errorHandler?.(error as Error);
        }
      });
    }
  }

  public static getInstance(): Bridge {
    if (!Bridge.instance) {
      Bridge.instance = new Bridge();
    }
    return Bridge.instance;
  }
}

export const bridge = Bridge.getInstance();