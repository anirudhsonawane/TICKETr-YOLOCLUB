// PhonePe Configuration Management
// This module handles environment-specific configuration for PhonePe integration

import { Env } from 'pg-sdk-node';

// Environment types
export type PhonePeEnvironment = 'development' | 'staging' | 'production';

// Configuration interface
export interface PhonePeConfig {
  // Client credentials
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  
  // Environment settings
  environment: Env;
  nodeEnvironment: PhonePeEnvironment;
  
  // API endpoints
  baseUrl: string;
  webhookUrl: string;
  
  // Webhook credentials
  webhookUsername: string;
  webhookPassword: string;
  
  // Feature flags
  bypassMode: boolean;
  enableLogging: boolean;
  enableReconciliation: boolean;
  
  // Reconciliation settings
  reconciliationConfig: {
    maxRetries: number;
    retryDelay: number;
    enableScheduledReconciliation: boolean;
  };
  
  // Security settings
  enableWebhookValidation: boolean;
  allowedOrigins: string[];
}

// Default configuration
const DEFAULT_CONFIG: Partial<PhonePeConfig> = {
  clientVersion: '1.0',
  environment: Env.SANDBOX,
  nodeEnvironment: 'development',
  bypassMode: false,
  enableLogging: true,
  enableReconciliation: true,
  enableWebhookValidation: true,
  reconciliationConfig: {
    maxRetries: 10,
    retryDelay: 3000,
    enableScheduledReconciliation: false
  },
  allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
};

// Environment-specific configurations
const ENVIRONMENT_CONFIGS: Record<PhonePeEnvironment, Partial<PhonePeConfig>> = {
  development: {
    environment: Env.SANDBOX,
    baseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox/',
    bypassMode: true, // Enable bypass mode for development
    enableLogging: true,
    enableReconciliation: false, // Disable reconciliation in development
    reconciliationConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      enableScheduledReconciliation: false
    }
  },
  
  staging: {
    environment: Env.SANDBOX,
    baseUrl: 'https://api-preprod.phonepe.com/apis/pg-sandbox/',
    bypassMode: false,
    enableLogging: true,
    enableReconciliation: true,
    reconciliationConfig: {
      maxRetries: 5,
      retryDelay: 2000,
      enableScheduledReconciliation: true
    }
  },
  
  production: {
    environment: Env.PRODUCTION,
    baseUrl: 'https://api.phonepe.com/apis/hermes/',
    bypassMode: false,
    enableLogging: false, // Disable detailed logging in production
    enableReconciliation: true,
    reconciliationConfig: {
      maxRetries: 10,
      retryDelay: 3000,
      enableScheduledReconciliation: true
    }
  }
};

// Configuration manager class
export class PhonePeConfigManager {
  private static instance: PhonePeConfigManager;
  private config: PhonePeConfig | null = null;

  private constructor() {}

  public static getInstance(): PhonePeConfigManager {
    if (!PhonePeConfigManager.instance) {
      PhonePeConfigManager.instance = new PhonePeConfigManager();
    }
    return PhonePeConfigManager.instance;
  }

  // Get configuration
  public getConfig(): PhonePeConfig {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config;
  }

  // Load configuration from environment variables
  private loadConfig(): PhonePeConfig {
    const nodeEnv = (process.env.NODE_ENV as PhonePeEnvironment) || 'development';
    const envConfig = ENVIRONMENT_CONFIGS[nodeEnv] || ENVIRONMENT_CONFIGS.development;

    // Validate required environment variables
    this.validateEnvironmentVariables();

    // Build configuration
    const config: PhonePeConfig = {
      // Client credentials
      clientId: process.env.PHONEPE_CLIENT_ID || '',
      clientSecret: process.env.PHONEPE_CLIENT_SECRET || '',
      clientVersion: process.env.PHONEPE_CLIENT_VERSION || envConfig.clientVersion || DEFAULT_CONFIG.clientVersion!,
      
      // Environment settings
      environment: envConfig.environment || DEFAULT_CONFIG.environment!,
      nodeEnvironment: nodeEnv,
      
      // API endpoints
      baseUrl: process.env.PHONEPE_BASE_URL || envConfig.baseUrl || DEFAULT_CONFIG.baseUrl!,
      webhookUrl: process.env.PHONEPE_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/phonepe`,
      
      // Webhook credentials
      webhookUsername: process.env.PHONEPE_WEBHOOK_USERNAME || '',
      webhookPassword: process.env.PHONEPE_WEBHOOK_PASSWORD || '',
      
      // Feature flags
      bypassMode: process.env.BYPASS_PHONEPE === 'true' || envConfig.bypassMode || DEFAULT_CONFIG.bypassMode!,
      enableLogging: process.env.PHONEPE_ENABLE_LOGGING !== 'false' && (envConfig.enableLogging ?? DEFAULT_CONFIG.enableLogging!),
      enableReconciliation: process.env.PHONEPE_ENABLE_RECONCILIATION !== 'false' && (envConfig.enableReconciliation ?? DEFAULT_CONFIG.enableReconciliation!),
      
      // Reconciliation settings
      reconciliationConfig: {
        maxRetries: parseInt(process.env.PHONEPE_MAX_RETRIES || '') || envConfig.reconciliationConfig?.maxRetries || DEFAULT_CONFIG.reconciliationConfig!.maxRetries,
        retryDelay: parseInt(process.env.PHONEPE_RETRY_DELAY || '') || envConfig.reconciliationConfig?.retryDelay || DEFAULT_CONFIG.reconciliationConfig!.retryDelay,
        enableScheduledReconciliation: process.env.PHONEPE_SCHEDULED_RECONCILIATION === 'true' || envConfig.reconciliationConfig?.enableScheduledReconciliation || DEFAULT_CONFIG.reconciliationConfig!.enableScheduledReconciliation
      },
      
      // Security settings
      enableWebhookValidation: process.env.PHONEPE_ENABLE_WEBHOOK_VALIDATION !== 'false' && DEFAULT_CONFIG.enableWebhookValidation!,
      allowedOrigins: process.env.PHONEPE_ALLOWED_ORIGINS?.split(',') || envConfig.allowedOrigins || DEFAULT_CONFIG.allowedOrigins!
    };

    // Validate configuration
    this.validateConfig(config);

    return config;
  }

  // Validate environment variables
  private validateEnvironmentVariables(): void {
    const requiredVars = [
      'PHONEPE_CLIENT_ID',
      'PHONEPE_CLIENT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required PhonePe environment variables: ${missingVars.join(', ')}`);
    }
  }

  // Validate configuration
  private validateConfig(config: PhonePeConfig): void {
    // Validate client credentials
    if (!config.clientId || !config.clientSecret) {
      throw new Error('PhonePe client credentials are required');
    }

    // Validate webhook credentials for non-bypass mode
    if (!config.bypassMode && (!config.webhookUsername || !config.webhookPassword)) {
      console.warn('PhonePe webhook credentials are missing. Webhook validation will be disabled.');
    }

    // Validate base URL
    if (!config.baseUrl) {
      throw new Error('PhonePe base URL is required');
    }

    // Validate reconciliation config
    if (config.reconciliationConfig.maxRetries < 1) {
      throw new Error('PhonePe reconciliation maxRetries must be at least 1');
    }

    if (config.reconciliationConfig.retryDelay < 100) {
      throw new Error('PhonePe reconciliation retryDelay must be at least 100ms');
    }
  }

  // Reload configuration
  public reloadConfig(): void {
    this.config = null;
    this.getConfig();
  }

  // Get environment-specific settings
  public getEnvironmentSettings(): {
    isDevelopment: boolean;
    isStaging: boolean;
    isProduction: boolean;
    isSandbox: boolean;
    isLive: boolean;
  } {
    const config = this.getConfig();
    
    return {
      isDevelopment: config.nodeEnvironment === 'development',
      isStaging: config.nodeEnvironment === 'staging',
      isProduction: config.nodeEnvironment === 'production',
      isSandbox: config.environment === Env.SANDBOX,
      isLive: config.environment === Env.PRODUCTION
    };
  }

  // Check if feature is enabled
  public isFeatureEnabled(feature: keyof Pick<PhonePeConfig, 'bypassMode' | 'enableLogging' | 'enableReconciliation' | 'enableWebhookValidation'>): boolean {
    const config = this.getConfig();
    return config[feature];
  }

  // Get reconciliation settings
  public getReconciliationConfig(): PhonePeConfig['reconciliationConfig'] {
    const config = this.getConfig();
    return config.reconciliationConfig;
  }

  // Get webhook settings
  public getWebhookConfig(): {
    url: string;
    username: string;
    password: string;
    enableValidation: boolean;
  } {
    const config = this.getConfig();
    return {
      url: config.webhookUrl,
      username: config.webhookUsername,
      password: config.webhookPassword,
      enableValidation: config.enableWebhookValidation
    };
  }

  // Get API settings
  public getApiConfig(): {
    baseUrl: string;
    environment: Env;
    clientId: string;
    clientSecret: string;
    clientVersion: string;
  } {
    const config = this.getConfig();
    return {
      baseUrl: config.baseUrl,
      environment: config.environment,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      clientVersion: config.clientVersion
    };
  }
}

// Export singleton instance
export const phonePeConfig = PhonePeConfigManager.getInstance();

// Utility functions
export function getPhonePeConfig(): PhonePeConfig {
  return phonePeConfig.getConfig();
}

export function isPhonePeFeatureEnabled(feature: keyof Pick<PhonePeConfig, 'bypassMode' | 'enableLogging' | 'enableReconciliation' | 'enableWebhookValidation'>): boolean {
  return phonePeConfig.isFeatureEnabled(feature);
}

export function getPhonePeEnvironmentSettings() {
  return phonePeConfig.getEnvironmentSettings();
}

// Environment variable documentation
export const PHONEPE_ENV_VARS = {
  // Required
  PHONEPE_CLIENT_ID: 'Your PhonePe client ID',
  PHONEPE_CLIENT_SECRET: 'Your PhonePe client secret',
  
  // Optional
  PHONEPE_CLIENT_VERSION: 'Client version (default: 1.0)',
  PHONEPE_BASE_URL: 'Custom base URL for PhonePe APIs',
  PHONEPE_WEBHOOK_URL: 'Custom webhook URL',
  PHONEPE_WEBHOOK_USERNAME: 'Webhook username for validation',
  PHONEPE_WEBHOOK_PASSWORD: 'Webhook password for validation',
  
  // Feature flags
  BYPASS_PHONEPE: 'Enable bypass mode (true/false)',
  PHONEPE_ENABLE_LOGGING: 'Enable detailed logging (true/false)',
  PHONEPE_ENABLE_RECONCILIATION: 'Enable reconciliation (true/false)',
  PHONEPE_ENABLE_WEBHOOK_VALIDATION: 'Enable webhook validation (true/false)',
  
  // Reconciliation settings
  PHONEPE_MAX_RETRIES: 'Maximum reconciliation retries (default: 10)',
  PHONEPE_RETRY_DELAY: 'Reconciliation retry delay in ms (default: 3000)',
  PHONEPE_SCHEDULED_RECONCILIATION: 'Enable scheduled reconciliation (true/false)',
  
  // Security
  PHONEPE_ALLOWED_ORIGINS: 'Comma-separated list of allowed origins'
};
