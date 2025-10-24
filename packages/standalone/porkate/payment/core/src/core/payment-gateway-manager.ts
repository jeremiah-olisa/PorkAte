import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { PaymentConfigurationException } from '../exceptions';
import {
  GatewayConfig,
  GatewayEnvConfig,
  GatewayFactory,
  PaymentGatewayManagerConfig,
} from '../interfaces';

/**
 * Payment Gateway Manager - Factory pattern for managing multiple payment adapters
 */
export class PaymentGatewayManager {
  private readonly gateways: Map<string, IPaymentGateway> = new Map();
  private readonly factories: Map<string, GatewayFactory> = new Map();
  private readonly gatewayConfigs: Map<string, GatewayConfig> = new Map();
  private defaultGateway?: string;
  private enableFallback: boolean = false;

  constructor(config?: PaymentGatewayManagerConfig) {
    if (config) {
      this.defaultGateway = config.defaultGateway;
      this.enableFallback = config.enableFallback ?? false;

      // Store gateway configs for later initialization
      config.gateways.forEach((gatewayConfig) => {
        this.gatewayConfigs.set(gatewayConfig.name, gatewayConfig);
      });
    }
  }

  /**
   * Register a gateway factory
   * @param name - Name of the gateway (e.g., 'paystack', 'flutterwave')
   * @param factory - Factory function to create the gateway instance
   */
  registerFactory<T = GatewayEnvConfig>(name: string, factory: GatewayFactory<T>): this {
    this.factories.set(name.toLowerCase(), factory as GatewayFactory<GatewayEnvConfig>);

    // If we have a config for this gateway, initialize it
    const config = this.gatewayConfigs.get(name.toLowerCase());
    if (config && config.enabled !== false) {
      try {
        const gateway = factory(config.config as T);
        this.gateways.set(name.toLowerCase(), gateway);
      } catch (error) {
        console.error(`Failed to initialize gateway '${name}':`, error);
      }
    }

    return this;
  }

  /**
   * Register a gateway instance directly
   * @param name - Name of the gateway
   * @param gateway - Gateway instance
   */
  registerGateway(name: string, gateway: IPaymentGateway): this {
    this.gateways.set(name.toLowerCase(), gateway);
    return this;
  }

  /**
   * Get a specific gateway by name
   * @param name - Name of the gateway
   * @throws {PaymentConfigurationException} If gateway not found
   */
  getGateway(name: string): IPaymentGateway {
    const gateway = this.gateways.get(name.toLowerCase());

    if (!gateway) {
      throw new PaymentConfigurationException(
        `Payment gateway '${name}' is not registered or enabled`,
        {
          gatewayName: name,
          availableGateways: Array.from(this.gateways.keys()),
        },
      );
    }

    if (!gateway.isReady()) {
      throw new PaymentConfigurationException(
        `Payment gateway '${name}' is not ready. Please check configuration.`,
        {
          gatewayName: name,
        },
      );
    }

    return gateway;
  }

  /**
   * Get the default gateway
   * @throws {PaymentConfigurationException} If no default gateway configured
   */
  getDefaultGateway(): IPaymentGateway {
    if (!this.defaultGateway) {
      // Try to get the first available gateway
      const firstGateway = this.gateways.values().next().value;
      if (firstGateway) {
        return firstGateway;
      }

      throw new PaymentConfigurationException(
        'No default gateway configured and no gateways available',
        {
          availableGateways: Array.from(this.gateways.keys()),
        },
      );
    }

    return this.getGateway(this.defaultGateway);
  }

  /**
   * Get a gateway with fallback support
   * @param preferredGateway - Preferred gateway name (optional)
   * @returns Gateway instance or null if no gateway available
   */
  getGatewayWithFallback(preferredGateway?: string): IPaymentGateway | null {
    // Try preferred gateway first
    if (preferredGateway) {
      try {
        const gateway = this.getGateway(preferredGateway);
        if (gateway.isReady()) {
          return gateway;
        }
      } catch (error) {
        if (!this.enableFallback) {
          throw error;
        }
        console.warn(`Preferred gateway '${preferredGateway}' not available, trying fallback`);
      }
    }

    // Try default gateway
    if (this.defaultGateway && (!preferredGateway || preferredGateway !== this.defaultGateway)) {
      try {
        const gateway = this.getGateway(this.defaultGateway);
        if (gateway.isReady()) {
          return gateway;
        }
      } catch (error) {
        if (!this.enableFallback) {
          throw error;
        }
        console.warn(`Default gateway '${this.defaultGateway}' not available, trying fallback`);
      }
    }

    // Try to find any available gateway (sorted by priority if configured)
    if (this.enableFallback) {
      const sortedGateways = this.getSortedGateways();
      for (const [name, gateway] of sortedGateways) {
        if (gateway.isReady() && name !== preferredGateway && name !== this.defaultGateway) {
          console.warn(`Using fallback gateway: ${name}`);
          return gateway;
        }
      }
    }

    return null;
  }

  /**
   * Get all registered gateway names
   */
  getAvailableGateways(): string[] {
    return Array.from(this.gateways.keys());
  }

  /**
   * Get all ready gateway names
   */
  getReadyGateways(): string[] {
    return Array.from(this.gateways.entries())
      .filter(([, gateway]) => gateway.isReady())
      .map(([name]) => name);
  }

  /**
   * Check if a gateway is registered
   */
  hasGateway(name: string): boolean {
    return this.gateways.has(name.toLowerCase());
  }

  /**
   * Check if a gateway is ready
   */
  isGatewayReady(name: string): boolean {
    const gateway = this.gateways.get(name.toLowerCase());
    return gateway ? gateway.isReady() : false;
  }

  /**
   * Set the default gateway
   */
  setDefaultGateway(name: string): this {
    if (!this.hasGateway(name)) {
      throw new PaymentConfigurationException(
        `Cannot set '${name}' as default gateway. Gateway not registered.`,
        {
          gatewayName: name,
          availableGateways: this.getAvailableGateways(),
        },
      );
    }

    this.defaultGateway = name.toLowerCase();
    return this;
  }

  /**
   * Enable or disable fallback support
   */
  setFallbackEnabled(enabled: boolean): this {
    this.enableFallback = enabled;
    return this;
  }

  /**
   * Remove a gateway
   */
  removeGateway(name: string): this {
    this.gateways.delete(name.toLowerCase());
    this.factories.delete(name.toLowerCase());
    this.gatewayConfigs.delete(name.toLowerCase());

    if (this.defaultGateway === name.toLowerCase()) {
      this.defaultGateway = undefined;
    }

    return this;
  }

  /**
   * Clear all gateways
   */
  clear(): this {
    this.gateways.clear();
    this.factories.clear();
    this.gatewayConfigs.clear();
    this.defaultGateway = undefined;
    return this;
  }

  /**
   * Get gateways sorted by priority
   */
  private getSortedGateways(): Array<[string, IPaymentGateway]> {
    return Array.from(this.gateways.entries()).sort((a, b) => {
      const configA = this.gatewayConfigs.get(a[0]);
      const configB = this.gatewayConfigs.get(b[0]);
      const priorityA = configA?.priority ?? 0;
      const priorityB = configB?.priority ?? 0;
      return priorityB - priorityA; // Higher priority first
    });
  }
}
