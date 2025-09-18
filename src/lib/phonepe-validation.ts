// PhonePe Configuration Validation Utility
// This module provides comprehensive validation for PhonePe integration

export interface PhonePeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: {
    hasCredentials: boolean;
    hasWebhookCredentials: boolean;
    environment: string;
    baseUrl: string;
    webhookUrl: string;
  };
}

export interface PhonePeEnvironmentConfig {
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  environment: string;
  baseUrl: string;
  webhookUrl: string;
  webhookUsername?: string;
  webhookPassword?: string;
  bypassMode: boolean;
}

// Validate PhonePe environment variables
export const validatePhonePeEnvironment = (): PhonePeValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required environment variables
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1.0';
  const environment = process.env.PHONEPE_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const baseUrl = process.env.PHONEPE_BASE_URL || getDefaultBaseUrl(environment);
  const webhookUrl = process.env.PHONEPE_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/phonepe`;
  const webhookUsername = process.env.PHONEPE_WEBHOOK_USERNAME;
  const webhookPassword = process.env.PHONEPE_WEBHOOK_PASSWORD;
  const bypassMode = process.env.BYPASS_PHONEPE === 'true';

  // Validate client ID
  if (!clientId) {
    errors.push('PHONEPE_CLIENT_ID is required');
  } else if (typeof clientId !== 'string' || clientId.trim().length === 0) {
    errors.push('PHONEPE_CLIENT_ID must be a non-empty string');
  } else if (clientId.length < 10) {
    warnings.push('PHONEPE_CLIENT_ID seems too short (should be at least 10 characters)');
  }

  // Validate client secret
  if (!clientSecret) {
    errors.push('PHONEPE_CLIENT_SECRET is required');
  } else if (typeof clientSecret !== 'string' || clientSecret.trim().length === 0) {
    errors.push('PHONEPE_CLIENT_SECRET must be a non-empty string');
  } else if (clientSecret.length < 20) {
    warnings.push('PHONEPE_CLIENT_SECRET seems too short (should be at least 20 characters)');
  }

  // Validate client version
  const version = parseInt(clientVersion);
  if (isNaN(version) || version < 1) {
    errors.push(`PHONEPE_CLIENT_VERSION must be a number >= 1, got: ${clientVersion}`);
  }

  // Validate environment
  const validEnvironments = ['development', 'staging', 'production', 'sandbox'];
  if (!validEnvironments.includes(environment.toLowerCase())) {
    warnings.push(`PHONEPE_ENVIRONMENT should be one of: ${validEnvironments.join(', ')}, got: ${environment}`);
  }

  // Validate base URL
  if (!baseUrl) {
    errors.push('PHONEPE_BASE_URL is required');
  } else if (!isValidUrl(baseUrl)) {
    errors.push(`PHONEPE_BASE_URL must be a valid URL, got: ${baseUrl}`);
  } else if (!baseUrl.includes('phonepe.com')) {
    warnings.push('PHONEPE_BASE_URL should contain "phonepe.com"');
  }

  // Validate webhook URL
  if (!webhookUrl) {
    errors.push('PHONEPE_WEBHOOK_URL is required');
  } else if (!isValidUrl(webhookUrl)) {
    errors.push(`PHONEPE_WEBHOOK_URL must be a valid URL, got: ${webhookUrl}`);
  }

  // Validate webhook credentials (warnings only, not required for bypass mode)
  if (!bypassMode) {
    if (!webhookUsername) {
      warnings.push('PHONEPE_WEBHOOK_USERNAME is recommended for webhook validation');
    }
    if (!webhookPassword) {
      warnings.push('PHONEPE_WEBHOOK_PASSWORD is recommended for webhook validation');
    }
  }

  // Validate NEXT_PUBLIC_BASE_URL
  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!publicBaseUrl) {
    warnings.push('NEXT_PUBLIC_BASE_URL is recommended for proper redirect URLs');
  } else if (!isValidUrl(publicBaseUrl)) {
    warnings.push(`NEXT_PUBLIC_BASE_URL must be a valid URL, got: ${publicBaseUrl}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: {
      hasCredentials: !!(clientId && clientSecret),
      hasWebhookCredentials: !!(webhookUsername && webhookPassword),
      environment,
      baseUrl,
      webhookUrl
    }
  };
};

// Get default base URL based on environment
const getDefaultBaseUrl = (environment: string): string => {
  switch (environment.toLowerCase()) {
    case 'production':
      return 'https://api.phonepe.com/apis/hermes/';
    case 'staging':
    case 'development':
    case 'sandbox':
    default:
      return 'https://api-preprod.phonepe.com/apis/pg-sandbox/';
  }
};

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate PhonePe configuration object
export const validatePhonePeConfig = (config: PhonePeEnvironmentConfig): PhonePeValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate client ID
  if (!config.clientId) {
    errors.push('clientId is required');
  } else if (typeof config.clientId !== 'string' || config.clientId.trim().length === 0) {
    errors.push('clientId must be a non-empty string');
  }

  // Validate client secret
  if (!config.clientSecret) {
    errors.push('clientSecret is required');
  } else if (typeof config.clientSecret !== 'string' || config.clientSecret.trim().length === 0) {
    errors.push('clientSecret must be a non-empty string');
  }

  // Validate client version
  const version = parseInt(config.clientVersion);
  if (isNaN(version) || version < 1) {
    errors.push(`clientVersion must be a number >= 1, got: ${config.clientVersion}`);
  }

  // Validate environment
  const validEnvironments = ['development', 'staging', 'production', 'sandbox'];
  if (!validEnvironments.includes(config.environment.toLowerCase())) {
    warnings.push(`environment should be one of: ${validEnvironments.join(', ')}, got: ${config.environment}`);
  }

  // Validate base URL
  if (!config.baseUrl) {
    errors.push('baseUrl is required');
  } else if (!isValidUrl(config.baseUrl)) {
    errors.push(`baseUrl must be a valid URL, got: ${config.baseUrl}`);
  }

  // Validate webhook URL
  if (!config.webhookUrl) {
    errors.push('webhookUrl is required');
  } else if (!isValidUrl(config.webhookUrl)) {
    errors.push(`webhookUrl must be a valid URL, got: ${config.webhookUrl}`);
  }

  // Validate webhook credentials
  if (!config.bypassMode) {
    if (!config.webhookUsername) {
      warnings.push('webhookUsername is recommended for webhook validation');
    }
    if (!config.webhookPassword) {
      warnings.push('webhookPassword is recommended for webhook validation');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: {
      hasCredentials: !!(config.clientId && config.clientSecret),
      hasWebhookCredentials: !!(config.webhookUsername && config.webhookPassword),
      environment: config.environment,
      baseUrl: config.baseUrl,
      webhookUrl: config.webhookUrl
    }
  };
};

// Get environment variable documentation
export const getPhonePeEnvVarDocs = () => {
  return {
    required: {
      PHONEPE_CLIENT_ID: 'Your PhonePe client ID (obtained from PhonePe dashboard)',
      PHONEPE_CLIENT_SECRET: 'Your PhonePe client secret (obtained from PhonePe dashboard)'
    },
    optional: {
      PHONEPE_CLIENT_VERSION: 'Client version (default: 1.0)',
      PHONEPE_ENVIRONMENT: 'Environment: development, staging, or production (default: NODE_ENV)',
      PHONEPE_BASE_URL: 'Custom base URL for PhonePe APIs (auto-detected based on environment)',
      PHONEPE_WEBHOOK_URL: 'Custom webhook URL (default: NEXT_PUBLIC_BASE_URL/api/webhooks/phonepe)',
      PHONEPE_WEBHOOK_USERNAME: 'Webhook username for validation',
      PHONEPE_WEBHOOK_PASSWORD: 'Webhook password for validation',
      BYPASS_PHONEPE: 'Enable bypass mode for testing (true/false)',
      NEXT_PUBLIC_BASE_URL: 'Public base URL for redirects (recommended)'
    }
  };
};

// Log validation results
export const logPhonePeValidation = (result: PhonePeValidationResult) => {
  console.log('=== PhonePe Configuration Validation ===');
  console.log('Valid:', result.isValid);
  
  if (result.errors.length > 0) {
    console.error('Errors:');
    result.errors.forEach(error => console.error(`  ❌ ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.warn('Warnings:');
    result.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
  }
  
  console.log('Configuration:');
  console.log('  Credentials:', result.config.hasCredentials ? '✅ Set' : '❌ Missing');
  console.log('  Webhook Credentials:', result.config.hasWebhookCredentials ? '✅ Set' : '⚠️  Missing');
  console.log('  Environment:', result.config.environment);
  console.log('  Base URL:', result.config.baseUrl);
  console.log('  Webhook URL:', result.config.webhookUrl);
  console.log('==========================================');
};
