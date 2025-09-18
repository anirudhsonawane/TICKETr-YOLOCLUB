// PhonePe SDK imports - using the official phonepe-pg-sdk-node
import { 
  StandardCheckoutClient, 
  Env, 
  StandardCheckoutPayRequest, 
  CreateSdkOrderRequest,
  RefundRequest,
  MetaInfo
} from 'phonepe-pg-sdk-node';
import { randomUUID } from 'crypto';
import { validatePhonePeEnvironment, logPhonePeValidation } from './phonepe-validation';

// Custom PhonePe Exception class
export class PhonePeException extends Error {
  public readonly code: string;
  public readonly httpStatusCode: number;
  public readonly data: any;

  constructor(message: string, code: string, httpStatusCode: number, data?: any) {
    super(message);
    this.name = 'PhonePeException';
    this.code = code;
    this.httpStatusCode = httpStatusCode;
    this.data = data;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PhonePeException);
    }
  }
}

// PhonePe configuration interface
interface PhonePeConfig {
  clientId: string;
  clientSecret: string;
  clientVersion: string;
  environment: Env;
}

// Singleton client instance
let phonePeClient: StandardCheckoutClient | null = null;

// PhonePe configuration
const getPhonePeConfig = (): PhonePeConfig => {
  // Validate environment variables first
  const validation = validatePhonePeEnvironment();
  logPhonePeValidation(validation);

  if (!validation.isValid) {
    const errorMsg = `PhonePe configuration validation failed: ${validation.errors.join(', ')}`;
    console.error('PhonePe configuration error:', {
      error: errorMsg,
      validation
    });
    throw new Error(errorMsg);
  }

  const clientId = process.env.PHONEPE_CLIENT_ID!;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1.0';
  
  // Use PHONEPE_ENVIRONMENT if set, otherwise fall back to NODE_ENV
  const environment = process.env.PHONEPE_ENVIRONMENT === 'production' 
    ? Env.PRODUCTION 
    : process.env.NODE_ENV === 'production' 
      ? Env.PRODUCTION 
      : Env.SANDBOX;

  console.log('PhonePe configuration loaded successfully');

  return {
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    clientVersion,
    environment,
  };
};

// Initialize PhonePe client singleton
export const getPhonePeClient = (): StandardCheckoutClient => {
  if (!phonePeClient) {
    const config = getPhonePeConfig();
    
    try {
      // Validate client version before parsing
      const version = parseInt(config.clientVersion);
      if (isNaN(version) || version < 1) {
        throw new Error(`Invalid PhonePe client version: ${config.clientVersion}. Must be a number >= 1`);
      }

      console.log('Initializing PhonePe client with config:', {
        clientId: config.clientId.substring(0, 8) + '...', // Mask sensitive data
        clientSecret: '***', // Mask sensitive data
        clientVersion: version,
        environment: config.environment === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX'
      });

      phonePeClient = StandardCheckoutClient.getInstance(
        config.clientId,
        config.clientSecret,
        version,
        config.environment
      );
      
      console.log('PhonePe client singleton initialized successfully');
    } catch (error) {
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        config: {
          clientId: config.clientId ? config.clientId.substring(0, 8) + '...' : 'MISSING',
          clientSecret: config.clientSecret ? '***' : 'MISSING',
          clientVersion: config.clientVersion,
          environment: config.environment
        }
      };
      
      console.error('Failed to initialize PhonePe client:', errorDetails);
      throw new PhonePeException(
        `PhonePe client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLIENT_INITIALIZATION_ERROR',
        500,
        errorDetails
      );
    }
  }
  
  return phonePeClient;
};

// Create payment request using StandardCheckoutPayRequest
export const createPhonePePaymentRequest = ({
  merchantOrderId,
  amount,
  redirectUrl,
  metaInfo = {},
}: {
  merchantOrderId: string;
  amount: number; // Amount in paisa
  redirectUrl: string;
  metaInfo?: Record<string, any>;
}) => {
  // Validate required parameters
  if (!merchantOrderId || !amount || !redirectUrl) {
    throw new Error(`Missing required parameters: merchantOrderId=${merchantOrderId}, amount=${amount}, redirectUrl=${redirectUrl}`);
  }

  // Ensure amount is a positive number and meets minimum requirement
  if (amount < 100) {
    throw new Error(`Invalid amount: ${amount}. Minimum amount is 100 paisa (₹1)`);
  }

  console.log("Creating PhonePe payment request with:", {
    merchantOrderId,
    amount,
    redirectUrl,
    metaInfo
  });

  try {
    // Create MetaInfo object if metaInfo is provided
    let metaInfoObj;
    if (metaInfo && Object.keys(metaInfo).length > 0) {
      const builder = MetaInfo.builder();
      
      // Add UDF fields if present
      if (metaInfo.udf1) builder.udf1(metaInfo.udf1);
      if (metaInfo.udf2) builder.udf2(metaInfo.udf2);
      if (metaInfo.udf3) builder.udf3(metaInfo.udf3);
      if (metaInfo.udf4) builder.udf4(metaInfo.udf4);
      if (metaInfo.udf5) builder.udf5(metaInfo.udf5);
      
      metaInfoObj = builder.build();
    }

    // Create payment request
    const builder = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .redirectUrl(redirectUrl);
    
    if (metaInfoObj) {
      builder.metaInfo(metaInfoObj);
    }
    
    const paymentRequest = builder.build();

    console.log("Payment request created successfully:", paymentRequest);
    return paymentRequest;
  } catch (error) {
    console.error("=== PHONEPE PAYMENT REQUEST ERROR ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw new Error(`Failed to build PhonePe request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Create SDK order for mobile app integration
export const createPhonePeSdkOrder = async ({
  merchantOrderId,
  amount,
  redirectUrl,
}: {
  merchantOrderId: string;
  amount: number; // Amount in paisa
  redirectUrl: string;
}) => {
  // Validate required parameters
  if (!merchantOrderId || !amount || !redirectUrl) {
    throw new Error(`Missing required parameters: merchantOrderId=${merchantOrderId}, amount=${amount}, redirectUrl=${redirectUrl}`);
  }

  // Ensure amount meets minimum requirement
  if (amount < 100) {
    throw new Error(`Invalid amount: ${amount}. Minimum amount is 100 paisa (₹1)`);
  }

  console.log("Creating PhonePe SDK order with:", {
    merchantOrderId,
    amount,
    redirectUrl
  });

  try {
    const client = getPhonePeClient();
    
    const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.createSdkOrder(request);
    console.log("SDK order created successfully:", response);
    return response;
  } catch (error) {
    console.error("=== PHONEPE SDK ORDER ERROR ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw new Error(`Failed to create SDK order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Create refund request
export const createPhonePeRefundRequest = ({
  merchantRefundId,
  originalMerchantOrderId,
  amount,
}: {
  merchantRefundId: string;
  originalMerchantOrderId: string;
  amount: number; // Amount in paisa
}) => {
  // Validate required parameters
  if (!merchantRefundId || !originalMerchantOrderId || !amount) {
    throw new Error(`Missing required parameters: merchantRefundId=${merchantRefundId}, originalMerchantOrderId=${originalMerchantOrderId}, amount=${amount}`);
  }

  // Ensure amount meets minimum requirement
  if (amount < 100) {
    throw new Error(`Invalid amount: ${amount}. Minimum refund amount is 100 paisa (₹1)`);
  }

  console.log("Creating PhonePe refund request with:", {
    merchantRefundId,
    originalMerchantOrderId,
    amount
  });

  try {
    const refundRequest = RefundRequest.builder()
      .merchantRefundId(merchantRefundId)
      .originalMerchantOrderId(originalMerchantOrderId)
      .amount(amount)
      .build();

    console.log("Refund request created successfully:", refundRequest);
    return refundRequest;
  } catch (error) {
    console.error("=== PHONEPE REFUND REQUEST ERROR ===");
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw new Error(`Failed to build refund request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Initiate payment with timeout handling
export const initiatePhonePePayment = async (paymentRequest: StandardCheckoutPayRequest) => {
  const timeoutMs = 30000; // 30 seconds timeout
  const startTime = Date.now();
  
  try {
    const client = getPhonePeClient();
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new PhonePeException(
          'Payment initiation timeout',
          'PAYMENT_TIMEOUT',
          408,
          { timeoutMs, startTime, currentTime: Date.now() }
        ));
      }, timeoutMs);
    });

    // Race between payment initiation and timeout
    const response = await Promise.race([
      client.pay(paymentRequest),
      timeoutPromise
    ]) as any;

    const duration = Date.now() - startTime;
    console.log("PhonePe payment initiated successfully:", {
      response: response,
      duration: `${duration}ms`,
      timeout: `${timeoutMs}ms`
    });
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("=== PHONEPE PAYMENT INITIATION ERROR ===");
    console.error("Error details:", {
      duration: `${duration}ms`,
      timeout: `${timeoutMs}ms`,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Convert generic errors to PhonePeException
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data,
        duration: `${duration}ms`
      });
    } else {
      console.error("General Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`
      });
      
      // Convert to PhonePeException for consistent handling
      const phonePeError = new PhonePeException(
        error instanceof Error ? error.message : String(error),
        'PAYMENT_INITIATION_ERROR',
        500,
        { originalError: error, duration: `${duration}ms` }
      );
      throw phonePeError;
    }
    throw error;
  }
};

// Check order status
export const checkPhonePeOrderStatus = async (merchantOrderId: string, details: boolean = false) => {
  try {
    const client = getPhonePeClient();
    const response = await client.getOrderStatus(merchantOrderId, details);
    console.log("PhonePe order status retrieved:", response);
    return response;
  } catch (error) {
    console.error("=== PHONEPE ORDER STATUS ERROR ===");
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data
      });
    } else {
      console.error("General Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Convert to PhonePeException for consistent handling
      const phonePeError = new PhonePeException(
        error instanceof Error ? error.message : String(error),
        'ORDER_STATUS_ERROR',
        500,
        { originalError: error }
      );
      throw phonePeError;
    }
    throw error;
  }
};

// Initiate refund
export const initiatePhonePeRefund = async (refundRequest: RefundRequest) => {
  try {
    const client = getPhonePeClient();
    const response = await client.refund(refundRequest);
    console.log("PhonePe refund initiated successfully:", response);
    return response;
  } catch (error) {
    console.error("=== PHONEPE REFUND INITIATION ERROR ===");
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data
      });
    } else {
      console.error("General Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Convert to PhonePeException for consistent handling
      const phonePeError = new PhonePeException(
        error instanceof Error ? error.message : String(error),
        'REFUND_INITIATION_ERROR',
        500,
        { originalError: error }
      );
      throw phonePeError;
    }
    throw error;
  }
};

// Check refund status
export const checkPhonePeRefundStatus = async (refundId: string) => {
  try {
    const client = getPhonePeClient();
    const response = await client.getRefundStatus(refundId);
    console.log("PhonePe refund status retrieved:", response);
    return response;
  } catch (error) {
    console.error("=== PHONEPE REFUND STATUS ERROR ===");
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data
      });
    } else {
      console.error("General Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Convert to PhonePeException for consistent handling
      const phonePeError = new PhonePeException(
        error instanceof Error ? error.message : String(error),
        'REFUND_STATUS_ERROR',
        500,
        { originalError: error }
      );
      throw phonePeError;
    }
    throw error;
  }
};

// Validate callback/webhook
export const validatePhonePeCallback = async (
  username: string,
  password: string,
  authorization: string,
  responseBody: string
) => {
  try {
    const client = getPhonePeClient();
    const response = await client.validateCallback(username, password, authorization, responseBody);
    console.log("PhonePe callback validated successfully:", response);
    return response;
  } catch (error) {
    console.error("=== PHONEPE CALLBACK VALIDATION ERROR ===");
    if (error instanceof PhonePeException) {
      console.error("PhonePe API Error:", {
        code: error.code,
        message: error.message,
        httpStatusCode: error.httpStatusCode,
        data: error.data
      });
    } else {
      console.error("General Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Convert to PhonePeException for consistent handling
      const phonePeError = new PhonePeException(
        error instanceof Error ? error.message : String(error),
        'CALLBACK_VALIDATION_ERROR',
        500,
        { originalError: error }
      );
      throw phonePeError;
    }
    throw error;
  }
};

// Get webhook credentials
export const getPhonePeWebhookCredentials = () => {
  const username = process.env.PHONEPE_WEBHOOK_USERNAME;
  const password = process.env.PHONEPE_WEBHOOK_PASSWORD;
  
  if (!username || !password) {
    throw new Error('PhonePe webhook credentials are missing. Please set PHONEPE_WEBHOOK_USERNAME and PHONEPE_WEBHOOK_PASSWORD environment variables.');
  }
  
  return { username, password };
};

// Disable Sentry for PhonePe to avoid CORS errors
export const configurePhonePeSentry = () => {
  // Override console.error to filter out PhonePe Sentry errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out PhonePe Sentry CORS errors
    if (message.includes('sentry.phonepe.com') || 
        message.includes('Access-Control-Allow-Origin') ||
        message.includes('ERR_FAILED 403 (Forbidden)') ||
        message.includes('raven.min.3.21.0.js')) {
      // Log to console with a different level to avoid noise
      console.warn('[PhonePe Sentry Filtered]:', ...args);
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };

  // Also handle unhandled promise rejections from PhonePe Sentry
  if (typeof window !== 'undefined') {
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && 
          (message.includes('sentry.phonepe.com') || 
           message.includes('raven.min.3.21.0.js'))) {
        console.warn('[PhonePe Sentry Error Filtered]:', message);
        return true; // Prevent default error handling
      }
      
      if (originalOnError) {
        return originalOnError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };
  }
};

// Handle PhonePe child window errors
export const configurePhonePeWindowHandling = () => {
  if (typeof window === 'undefined') return;

  // Override window.open to handle PhonePe popup requirements
  const originalWindowOpen = window.open;
  window.open = function(url?: string | URL, target?: string, features?: string) {
    try {
      // Ensure we have a valid target
      const validTarget = target || '_blank';
      
      // Add features to ensure popup works properly
      const popupFeatures = features || 'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no';
      
      const popup = originalWindowOpen.call(window, url, validTarget, popupFeatures);
      
      if (!popup) {
        console.warn('PhonePe popup blocked. Falling back to redirect.');
        // Fallback to redirect if popup is blocked
        if (url) {
          window.location.href = url.toString();
        }
        return null;
      }
      
      return popup;
    } catch (error) {
      console.error('PhonePe window.open error:', error);
      // Fallback to redirect
      if (url) {
        window.location.href = url.toString();
      }
      return null;
    }
  };

  // Handle child window errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out PhonePe child window errors
    if (message.includes('There is no child window!') || 
        message.includes('child window') ||
        message.includes('popup blocked')) {
      console.warn('[PhonePe Window Filtered]:', ...args);
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };
};

// Utility function to convert rupees to paisa
export const convertToPaisa = (amountInRupees: number): number => {
  return Math.round(amountInRupees * 100);
};

// Utility function to convert paisa to rupees
export const convertToRupees = (amountInPaisa: number): number => {
  return amountInPaisa / 100;
};

// Generate unique order ID
export const generatePhonePeOrderId = (prefix: string = 'TICKET'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

// Generate unique refund ID
export const generatePhonePeRefundId = (prefix: string = 'REFUND'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

// PhonePe payment status constants
export const PHONEPE_PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const PHONEPE_REFUND_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const PHONEPE_CALLBACK_TYPES = {
  CHECKOUT_ORDER_COMPLETED: 'CHECKOUT_ORDER_COMPLETED',
  CHECKOUT_ORDER_FAILED: 'CHECKOUT_ORDER_FAILED',
  PG_REFUND_COMPLETED: 'PG_REFUND_COMPLETED',
  PG_REFUND_FAILED: 'PG_REFUND_FAILED',
  PG_REFUND_ACCEPTED: 'PG_REFUND_ACCEPTED',
} as const;

export type PhonePePaymentStatus = typeof PHONEPE_PAYMENT_STATUS[keyof typeof PHONEPE_PAYMENT_STATUS];
export type PhonePeRefundStatus = typeof PHONEPE_REFUND_STATUS[keyof typeof PHONEPE_REFUND_STATUS];
export type PhonePeCallbackType = typeof PHONEPE_CALLBACK_TYPES[keyof typeof PHONEPE_CALLBACK_TYPES];

// Reconciliation schedule for pending transactions
export const PHONEPE_RECONCILIATION_SCHEDULE = [
  { delay: 20000, interval: 3000, duration: 30000 }, // First 20-25 seconds, then every 3 seconds for 30 seconds
  { delay: 50000, interval: 6000, duration: 60000 }, // Every 6 seconds for 60 seconds
  { delay: 110000, interval: 10000, duration: 60000 }, // Every 10 seconds for 60 seconds
  { delay: 170000, interval: 30000, duration: 60000 }, // Every 30 seconds for 60 seconds
  { delay: 230000, interval: 60000, duration: Infinity }, // Every 1 minute until terminal status
];

// Helper function to check if payment is in terminal state
export const isTerminalPaymentState = (state: string): boolean => {
  return state === PHONEPE_PAYMENT_STATUS.COMPLETED || state === PHONEPE_PAYMENT_STATUS.FAILED;
};

// Helper function to check if refund is in terminal state
export const isTerminalRefundState = (state: string): boolean => {
  return state === PHONEPE_REFUND_STATUS.COMPLETED || state === PHONEPE_REFUND_STATUS.FAILED;
};