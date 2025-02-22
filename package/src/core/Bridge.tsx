import React from 'react';
import { BladeAPI, BridgeConfig } from '../types';
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
    this.initGlobal();
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

    // Skip if already mounted
    if (element.hasAttribute('data-mounted')) return;

    // Check if the component exists in the registry
    if (!this.componentRegistry.has(componentName)) {
      console.warn(`[BladeReact] Component ${componentName} not registered. Skipping process.`);
      return;
    }

    this.mount(componentName, element);
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

      this.mount(componentName, element);
    });
  }
  private buildComponentStructure(element: HTMLElement): React.ReactNode {
    const componentName = element.dataset.bladeReact;

    if (!componentName) {
      return element.outerHTML;
    }

    const props = this.getElementProps(element);
    const children: React.ReactNode[] = [];
    let childIndex = 0;

    // Process child container content
    const childContainer: any = element.querySelector('template[data-child-container]');
    if (childContainer) {
      Array.from(childContainer.content.childNodes).forEach((node: any) => {
        if (node instanceof HTMLElement) {
          if (node.dataset.bladeReact) {
            // Process child Blade React components
            const childComponent = this.buildComponentStructure(node);
            if (childComponent) {
              // Wrap child component with key
              children.push(React.createElement(
                  React.Fragment,
                  { key: `react-child-${childIndex++}` },
                  childComponent
              ));
            }
          } else if (!node.classList.contains('react-content')) {
            // Handle regular HTML elements, excluding react-content
            children.push(
                React.createElement('div', {
                  key: `html-child-${childIndex++}`,
                  dangerouslySetInnerHTML: { __html: node.outerHTML }
                })
            );
          }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          // Wrap text nodes with Fragment and key
          children.push(
              React.createElement(
                  React.Fragment,
                  { key: `text-child-${childIndex++}` },
                  node.textContent.trim()
              )
          );
        }
      });
    }

    // Handle slots
    const slotContainer: any = element.querySelector('template[data-slot-container]');
    if (slotContainer) {
      slotContainer.content.querySelectorAll('[data-slot]').forEach((slot: any) => {
        if (slot instanceof HTMLElement) {
          children.push(
              React.createElement('div', {
                key: `slot-${slot.getAttribute('data-slot') || '__default'}-${childIndex++}`,
                dangerouslySetInnerHTML: { __html: slot.innerHTML }
              })
          );
        }
      });
    }

    // Check if component is registered
    if (!this.componentRegistry.has(componentName)) {
      console.warn(`[BladeReact] Component ${componentName} not registered. Rendering children only.`);
      return children.length > 0 ? React.createElement('div', null, children) : null;
    }

    // Get and render the registered component
    const Component: any = this.componentRegistry.get(componentName);
    return React.createElement(Component, {
      ...props,
      children: children.length > 0 ? children : undefined
    });
  }
  private getElementProps(element: HTMLElement): Record<string, any> {
    const props: Record<string, any> = {};

    element.getAttributeNames()
        .filter(name => name.startsWith('data-prop-'))
        .forEach(name => {
          const key = name
              .replace('data-prop-', '')
              .split('-')
              .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
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
        const mountContainer: any = element.querySelector('.react-content');
        if (!mountContainer) {
          console.error(`[BladeReact] No mount container found for ${name}`);
          return;
        }

        const root = this.rootManager.getOrCreateRoot(mountContainer);
        element.setAttribute('data-mounted', 'true');

        root.render(this.buildComponentStructure(element));

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