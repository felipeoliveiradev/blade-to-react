import { createRoot }                              from 'react-dom/client';
import React                                       from 'react';
import { ComponentConfig, BridgeConfig, BladeAPI } from '../types';


class Bridge {
  private static instance: Bridge;
  private data: Record<string, any> = {};
  private listeners: Map<string, Set<(value: any) => void>> = new Map();
  private components: Map<string, ComponentConfig> = new Map();
  private integrations: Map<string, { 
    library: any, 
    config: any 
  }> = new Map();
  private config: BridgeConfig = {
    debug: false,
    autoInit: true
  };

  private constructor() {
    this.initGlobal();
    if (this.config.autoInit) {
      this.initAutoMount();
    }
  }

  private initGlobal() {
    // API Global
    const api: BladeAPI = {
      // Core API
      get: this.get.bind(this),
      set: this.set.bind(this),
      listen: this.listen.bind(this),
      emit: this.emit.bind(this),
      // Componentes
      mount: this.mount.bind(this),
      register: this.register.bind(this),
      unmount: this.unmount.bind(this),
      init: this.init.bind(this),
      // Integrações
      integrate: this.integrate.bind(this),
      
      // Debug
      debug: this.debug.bind(this)
    };
  
    window.blade = api;
  }

  private initAutoMount() {
    // Observer para montar componentes automaticamente
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.dataset.bladeReact) {
              this.mountElement(node);
            }
            // Procura dentro do node também
            node.querySelectorAll('[data-blade-react]').forEach(el => {
              this.mountElement(el as HTMLElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Monta componentes existentes
    document.querySelectorAll('[data-blade-react]').forEach(el => {
      this.mountElement(el as HTMLElement);
    });
  }
  init(config: { debug: boolean; autoInit: boolean }): void {
    this.config = { ...this.config, ...config };
    if (this.config.debug) {
        console.log('[BladeReact] Initialized with config:', config);
    }
    if (this.config.autoInit) {
        this.initAutoMount();
    }
}
  private mountElement(element: HTMLElement) {
    const name = element.dataset.bladeReact;
    if (!name) return;

    // Coleta props do elemento
    const props = this.getElementProps(element);
    
    // Coleta slots
    const slots = this.getElementSlots(element);

    this.mount(name, { ...props, slots });
  }

  private getElementProps(element: HTMLElement): Record<string, any> {
    const props: Record<string, any> = {};
    
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-prop-')) {
        const propName = attr.name.replace('data-prop-', '');
        let value = attr.value;

        try {
          value = JSON.parse(value);
        } catch {
          // Mantém como string se não for JSON
        }

        props[propName] = value;
      }
    });

    return props;
  }

  private getElementSlots(element: HTMLElement): Record<string, string> {
    const slots: Record<string, string> = {};
    
    element.querySelectorAll('[data-slot]').forEach(slot => {
      const name = slot.getAttribute('data-slot') || 'default';
      slots[name] = slot.innerHTML;
    });

    return slots;
  }

  // Core API Methods
  static getInstance(config?: BridgeConfig): Bridge {
    if (!Bridge.instance) {
      Bridge.instance = new Bridge();
      if (config) {
        Bridge.instance.config = { ...Bridge.instance.config, ...config };
      }
    }
    return Bridge.instance;
  }

  get(key?: string): any {
    return key ? this.data[key] : this.data;
  }

  set(key: string, value: any): void {
    this.data[key] = value;
    this.notify(key, value);
  }

  listen(key: string, callback: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(callback);
    return () => this.listeners.get(key)?.delete(callback);
  }

  emit(event: string, data?: any): void {
    this.notify(event, data);

    // Eventos especiais
    if (event === 'validation:error') {
      this.handleValidationError(data);
    }
  }

  // Component Methods
  register(name: string, component: React.ComponentType<any>): void {
    this.components.set(name, { component });
    if (this.config.debug) {
      console.log(`[BladeReact] Registered component: ${name}`);
    }
  }

  mount(name: string, props: any = {}): void {
    const config = this.components.get(name);
    if (!config) {
      console.warn(`[BladeReact] Component ${name} not found`);
      return;
    }

    const element = document.querySelector(`[data-blade-react="${name}"]`);
    if (!element) {
      console.warn(`[BladeReact] Mount point for ${name} not found`);
      return;
    }

    const root = createRoot(element);
    root.render(React.createElement(config.component, props));

    config.root = root;
    config.props = props;

    if (this.config.debug) {
      console.log(`[BladeReact] Mounted component: ${name}`, { props });
    }
  }

  unmount(name: string): void {
    const config = this.components.get(name);
    if (config?.root) {
      config.root.unmount();
      this.components.delete(name);
    }
  }

  // Integration Methods
  integrate(name: string, library: any, config: any = {}): void {
    this.integrations.set(name, { library, config });
    
    if (this.config.debug) {
      console.log(`[BladeReact] Integrated library: ${name}`);
    }
  
    this.emit('integration:added', { name, library, config });
  }

  private handleValidationError(errors: any[]): void {
    // Notifica componentes React sobre erros
    this.set('validationErrors', errors);
    
    // Adiciona classes de erro se necessário
    errors.forEach(error => {
      const element = document.querySelector(`[name="${error.element.name}"]`);
      if (element) {
        element.classList.add('is-invalid');
      }
    });
  }

hasIntegration(name: string): boolean {
  return this.integrations.has(name);
}

getIntegration(name: string): any {
  return this.integrations.get(name);
}

  private notify(key: string, value: any): void {
    if (this.listeners.has(key)) {
      this.listeners.get(key)?.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`[BladeReact] Error in listener for ${key}:`, error);
        }
      });
    }
  }

  debug(): void {
    console.group('[BladeReact] Debug Info');
    console.log('Components:', Array.from(this.components.entries()));
    console.log('State:', this.data);
    console.log('Listeners:', Array.from(this.listeners.entries()));
    console.log('Integrations:', Array.from(this.integrations.entries()));
    console.groupEnd();
  }
}

export const bridge = Bridge.getInstance();
