// PhonePe Reconciliation Service
// This service handles reconciliation of pending transactions according to PhonePe's recommended schedule

import { 
  checkPhonePeOrderStatus,
  checkPhonePeRefundStatus,
  PHONEPE_RECONCILIATION_SCHEDULE,
  isTerminalPaymentState,
  isTerminalRefundState,
  PhonePeException,
  PHONEPE_PAYMENT_STATUS,
  PHONEPE_REFUND_STATUS
} from './phonepe';

// Reconciliation configuration
interface ReconciliationConfig {
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
}

// Reconciliation result
interface ReconciliationResult {
  success: boolean;
  finalState: string;
  attempts: number;
  isTerminal: boolean;
  error?: string;
  lastResponse?: any;
}

// Default configuration
const DEFAULT_CONFIG: ReconciliationConfig = {
  maxRetries: 10,
  retryDelay: 3000,
  enableLogging: true
};

// Logger utility
const log = (message: string, data?: any) => {
  if (DEFAULT_CONFIG.enableLogging) {
    console.log(`[PhonePe Reconciliation] ${message}`, data || '');
  }
};

// Error logger utility
const logError = (message: string, error?: any) => {
  if (DEFAULT_CONFIG.enableLogging) {
    console.error(`[PhonePe Reconciliation Error] ${message}`, error || '');
  }
};

// Reconcile payment order
export async function reconcilePaymentOrder(
  merchantOrderId: string,
  config: Partial<ReconciliationConfig> = {}
): Promise<ReconciliationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let attempts = 0;
  let lastResponse = null;
  let isTerminal = false;
  let lastError = null;

  log(`Starting payment reconciliation for order: ${merchantOrderId}`);

  // Follow PhonePe's recommended reconciliation schedule
  for (const schedule of PHONEPE_RECONCILIATION_SCHEDULE) {
    if (attempts >= finalConfig.maxRetries || isTerminal) {
      break;
    }

    // Calculate delay for this schedule
    const delay = schedule.delay + (attempts * schedule.interval);
    
    if (attempts > 0) {
      log(`Waiting ${schedule.interval}ms before next attempt (attempt ${attempts + 1})`);
      await new Promise(resolve => setTimeout(resolve, schedule.interval));
    }

    attempts++;

    try {
      log(`Reconciliation attempt ${attempts} for order: ${merchantOrderId}`);
      
      const response = await checkPhonePeOrderStatus(merchantOrderId, true);
      lastResponse = response;
      
      log(`Attempt ${attempts} response:`, {
        state: response.state,
        orderId: response.orderId,
        amount: response.amount
      });

      // Check if payment is in terminal state
      isTerminal = isTerminalPaymentState(response.state);
      
      if (isTerminal) {
        log(`Order ${merchantOrderId} reached terminal state: ${response.state}`);
        break;
      }

      // Check if we've exceeded the duration for this schedule
      if (attempts * schedule.interval >= schedule.duration) {
        log(`Reached duration limit for schedule, moving to next schedule`);
        continue;
      }

    } catch (error) {
      lastError = error;
      logError(`Reconciliation attempt ${attempts} failed:`, error);
      
      // If it's a PhonePe API error, we might want to stop reconciliation
      if (error instanceof PhonePeException) {
        logError("PhonePe API Error during reconciliation:", {
          code: error.code,
          message: error.message,
          httpStatusCode: error.httpStatusCode
        });
        
        // For certain errors, we might want to stop reconciliation
        if (error.httpStatusCode >= 400 && error.httpStatusCode < 500) {
          logError("Stopping reconciliation due to client error");
          break;
        }
      }
    }
  }

  // Return the final result
  const result: ReconciliationResult = {
    success: isTerminal && lastResponse !== null,
    finalState: lastResponse?.state || 'UNKNOWN',
    attempts,
    isTerminal,
    error: lastError ? (lastError instanceof Error ? lastError.message : String(lastError)) : undefined,
    lastResponse
  };

  log(`Reconciliation completed for order ${merchantOrderId}:`, result);
  return result;
}

// Reconcile refund order
export async function reconcileRefundOrder(
  refundId: string,
  config: Partial<ReconciliationConfig> = {}
): Promise<ReconciliationResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let attempts = 0;
  let lastResponse = null;
  let isTerminal = false;
  let lastError = null;

  log(`Starting refund reconciliation for refund: ${refundId}`);

  // For refunds, we use a simpler retry mechanism
  while (attempts < finalConfig.maxRetries && !isTerminal) {
    attempts++;

    try {
      log(`Refund reconciliation attempt ${attempts} for refund: ${refundId}`);
      
      const response = await checkPhonePeRefundStatus(refundId);
      lastResponse = response;
      
      log(`Attempt ${attempts} response:`, {
        state: response.state,
        refundId: response.refundId,
        amount: response.amount
      });

      // Check if refund is in terminal state
      isTerminal = isTerminalRefundState(response.state);
      
      if (isTerminal) {
        log(`Refund ${refundId} reached terminal state: ${response.state}`);
        break;
      }

      // Wait before next attempt (except for the last attempt)
      if (attempts < finalConfig.maxRetries) {
        log(`Waiting ${finalConfig.retryDelay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay));
      }

    } catch (error) {
      lastError = error;
      logError(`Refund reconciliation attempt ${attempts} failed:`, error);
      
      // If it's a PhonePe API error, we might want to stop reconciliation
      if (error instanceof PhonePeException) {
        logError("PhonePe API Error during refund reconciliation:", {
          code: error.code,
          message: error.message,
          httpStatusCode: error.httpStatusCode
        });
        
        // For certain errors, we might want to stop reconciliation
        if (error.httpStatusCode >= 400 && error.httpStatusCode < 500) {
          logError("Stopping refund reconciliation due to client error");
          break;
        }
      }
      
      // Wait before retry (except for the last attempt)
      if (attempts < finalConfig.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay));
      }
    }
  }

  // Return the final result
  const result: ReconciliationResult = {
    success: isTerminal && lastResponse !== null,
    finalState: lastResponse?.state || 'UNKNOWN',
    attempts,
    isTerminal,
    error: lastError ? (lastError instanceof Error ? lastError.message : String(lastError)) : undefined,
    lastResponse
  };

  log(`Refund reconciliation completed for refund ${refundId}:`, result);
  return result;
}

// Batch reconciliation for multiple orders
export async function batchReconcilePaymentOrders(
  merchantOrderIds: string[],
  config: Partial<ReconciliationConfig> = {}
): Promise<Record<string, ReconciliationResult>> {
  log(`Starting batch reconciliation for ${merchantOrderIds.length} orders`);
  
  const results: Record<string, ReconciliationResult> = {};
  
  // Process orders in parallel (with some concurrency limit)
  const concurrencyLimit = 5;
  const chunks = [];
  
  for (let i = 0; i < merchantOrderIds.length; i += concurrencyLimit) {
    chunks.push(merchantOrderIds.slice(i, i + concurrencyLimit));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (merchantOrderId) => {
      const result = await reconcilePaymentOrder(merchantOrderId, config);
      results[merchantOrderId] = result;
    });
    
    await Promise.all(promises);
  }
  
  log(`Batch reconciliation completed for ${merchantOrderIds.length} orders`);
  return results;
}

// Batch reconciliation for multiple refunds
export async function batchReconcileRefundOrders(
  refundIds: string[],
  config: Partial<ReconciliationConfig> = {}
): Promise<Record<string, ReconciliationResult>> {
  log(`Starting batch reconciliation for ${refundIds.length} refunds`);
  
  const results: Record<string, ReconciliationResult> = {};
  
  // Process refunds in parallel (with some concurrency limit)
  const concurrencyLimit = 5;
  const chunks = [];
  
  for (let i = 0; i < refundIds.length; i += concurrencyLimit) {
    chunks.push(refundIds.slice(i, i + concurrencyLimit));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (refundId) => {
      const result = await reconcileRefundOrder(refundId, config);
      results[refundId] = result;
    });
    
    await Promise.all(promises);
  }
  
  log(`Batch refund reconciliation completed for ${refundIds.length} refunds`);
  return results;
}

// Get reconciliation statistics
export function getReconciliationStats(results: Record<string, ReconciliationResult>) {
  const total = Object.keys(results).length;
  const successful = Object.values(results).filter(r => r.success).length;
  const failed = total - successful;
  const terminal = Object.values(results).filter(r => r.isTerminal).length;
  const nonTerminal = total - terminal;
  
  const attempts = Object.values(results).reduce((sum, r) => sum + r.attempts, 0);
  const avgAttempts = total > 0 ? attempts / total : 0;
  
  return {
    total,
    successful,
    failed,
    terminal,
    nonTerminal,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    terminalRate: total > 0 ? (terminal / total) * 100 : 0,
    avgAttempts: Math.round(avgAttempts * 100) / 100
  };
}

// Export types for external use
export type { ReconciliationConfig, ReconciliationResult };
