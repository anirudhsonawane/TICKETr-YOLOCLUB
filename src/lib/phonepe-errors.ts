// PhonePe Error Handling Utilities
// This module provides comprehensive error handling for PhonePe integration

import { PhonePeException } from './phonepe';

// Error types
export enum PhonePeErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INSUFFICIENT_FUNDS_ERROR = 'INSUFFICIENT_FUNDS_ERROR',
  INVALID_AMOUNT_ERROR = 'INVALID_AMOUNT_ERROR',
  ORDER_NOT_FOUND_ERROR = 'ORDER_NOT_FOUND_ERROR',
  REFUND_NOT_FOUND_ERROR = 'REFUND_NOT_FOUND_ERROR',
  WEBHOOK_VALIDATION_ERROR = 'WEBHOOK_VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Custom PhonePe error class
export class PhonePeIntegrationError extends Error {
  public readonly type: PhonePeErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly httpStatusCode?: number;
  public readonly data?: any;
  public readonly retryable: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: PhonePeErrorType,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      code?: string;
      httpStatusCode?: number;
      data?: any;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'PhonePeIntegrationError';
    this.type = type;
    this.severity = severity;
    this.code = options.code;
    this.httpStatusCode = options.httpStatusCode;
    this.data = options.data;
    this.retryable = options.retryable ?? false;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PhonePeIntegrationError);
    }

    // Set cause if provided
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

// Error handler class
export class PhonePeErrorHandler {
  private static instance: PhonePeErrorHandler;
  private errorLog: Array<PhonePeIntegrationError> = [];
  private maxLogSize = 1000;

  private constructor() {}

  public static getInstance(): PhonePeErrorHandler {
    if (!PhonePeErrorHandler.instance) {
      PhonePeErrorHandler.instance = new PhonePeErrorHandler();
    }
    return PhonePeErrorHandler.instance;
  }

  // Handle PhonePe SDK exceptions
  public handlePhonePeException(error: PhonePeException): PhonePeIntegrationError {
    const errorType = this.mapPhonePeExceptionToErrorType(error);
    const severity = this.determineSeverity(errorType, error.httpStatusCode);
    const retryable = this.isRetryable(errorType, error.httpStatusCode);

    const integrationError = new PhonePeIntegrationError(
      `PhonePe API Error: ${error.message}`,
      errorType,
      severity,
      {
        code: error.code,
        httpStatusCode: error.httpStatusCode,
        data: error.data,
        retryable,
        cause: error
      }
    );

    this.logError(integrationError);
    return integrationError;
  }

  // Handle general errors
  public handleError(error: Error, context?: string): PhonePeIntegrationError {
    const errorType = this.mapGeneralErrorToErrorType(error);
    const severity = this.determineSeverity(errorType);
    const retryable = this.isRetryable(errorType);

    const message = context ? `${context}: ${error.message}` : error.message;
    const integrationError = new PhonePeIntegrationError(
      message,
      errorType,
      severity,
      {
        retryable,
        cause: error
      }
    );

    this.logError(integrationError);
    return integrationError;
  }

  // Map PhonePe exceptions to error types
  private mapPhonePeExceptionToErrorType(error: PhonePeException): PhonePeErrorType {
    const statusCode = error.httpStatusCode;
    const message = error.message.toLowerCase();

    // Authentication errors
    if (statusCode === 401 || message.includes('unauthorized') || message.includes('authentication')) {
      return PhonePeErrorType.AUTHENTICATION_ERROR;
    }

    // Configuration errors
    if (statusCode === 403 || message.includes('forbidden') || message.includes('credentials')) {
      return PhonePeErrorType.CONFIGURATION_ERROR;
    }

    // Validation errors
    if (statusCode === 400 || message.includes('validation') || message.includes('invalid')) {
      if (message.includes('amount')) {
        return PhonePeErrorType.INVALID_AMOUNT_ERROR;
      }
      return PhonePeErrorType.VALIDATION_ERROR;
    }

    // Not found errors
    if (statusCode === 404) {
      if (message.includes('order')) {
        return PhonePeErrorType.ORDER_NOT_FOUND_ERROR;
      }
      if (message.includes('refund')) {
        return PhonePeErrorType.REFUND_NOT_FOUND_ERROR;
      }
    }

    // Rate limiting
    if (statusCode === 429 || message.includes('rate limit')) {
      return PhonePeErrorType.RATE_LIMIT_ERROR;
    }

    // Insufficient funds
    if (message.includes('insufficient') || message.includes('funds')) {
      return PhonePeErrorType.INSUFFICIENT_FUNDS_ERROR;
    }

    // Timeout errors
    if (statusCode === 408 || message.includes('timeout')) {
      return PhonePeErrorType.TIMEOUT_ERROR;
    }

    // Network errors
    if (statusCode >= 500 || message.includes('network') || message.includes('connection')) {
      return PhonePeErrorType.NETWORK_ERROR;
    }

    // Default to API error
    return PhonePeErrorType.API_ERROR;
  }

  // Map general errors to error types
  private mapGeneralErrorToErrorType(error: Error): PhonePeErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('credentials') || message.includes('configuration')) {
      return PhonePeErrorType.CONFIGURATION_ERROR;
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return PhonePeErrorType.VALIDATION_ERROR;
    }

    if (message.includes('network') || message.includes('connection')) {
      return PhonePeErrorType.NETWORK_ERROR;
    }

    if (message.includes('timeout')) {
      return PhonePeErrorType.TIMEOUT_ERROR;
    }

    return PhonePeErrorType.UNKNOWN_ERROR;
  }

  // Determine error severity
  private determineSeverity(errorType: PhonePeErrorType, httpStatusCode?: number): ErrorSeverity {
    // Critical errors
    if (errorType === PhonePeErrorType.CONFIGURATION_ERROR || 
        errorType === PhonePeErrorType.AUTHENTICATION_ERROR) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (errorType === PhonePeErrorType.INSUFFICIENT_FUNDS_ERROR ||
        errorType === PhonePeErrorType.INVALID_AMOUNT_ERROR ||
        (httpStatusCode && httpStatusCode >= 500)) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (errorType === PhonePeErrorType.API_ERROR ||
        errorType === PhonePeErrorType.NETWORK_ERROR ||
        errorType === PhonePeErrorType.TIMEOUT_ERROR ||
        (httpStatusCode && httpStatusCode >= 400 && httpStatusCode < 500)) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors
    return ErrorSeverity.LOW;
  }

  // Determine if error is retryable
  private isRetryable(errorType: PhonePeErrorType, httpStatusCode?: number): boolean {
    // Non-retryable errors
    if (errorType === PhonePeErrorType.CONFIGURATION_ERROR ||
        errorType === PhonePeErrorType.AUTHENTICATION_ERROR ||
        errorType === PhonePeErrorType.VALIDATION_ERROR ||
        errorType === PhonePeErrorType.INVALID_AMOUNT_ERROR ||
        errorType === PhonePeErrorType.INSUFFICIENT_FUNDS_ERROR ||
        errorType === PhonePeErrorType.ORDER_NOT_FOUND_ERROR ||
        errorType === PhonePeErrorType.REFUND_NOT_FOUND_ERROR) {
      return false;
    }

    // Retryable errors
    if (errorType === PhonePeErrorType.NETWORK_ERROR ||
        errorType === PhonePeErrorType.TIMEOUT_ERROR ||
        errorType === PhonePeErrorType.RATE_LIMIT_ERROR ||
        (httpStatusCode && httpStatusCode >= 500)) {
      return true;
    }

    // Default to non-retryable for unknown errors
    return false;
  }

  // Log error
  private logError(error: PhonePeIntegrationError): void {
    this.errorLog.push(error);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(`[CRITICAL] PhonePe Error:`, error);
        break;
      case ErrorSeverity.HIGH:
        console.error(`[HIGH] PhonePe Error:`, error);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(`[MEDIUM] PhonePe Error:`, error);
        break;
      case ErrorSeverity.LOW:
        console.log(`[LOW] PhonePe Error:`, error);
        break;
    }
  }

  // Get error statistics
  public getErrorStats(): {
    total: number;
    byType: Record<PhonePeErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    retryable: number;
    nonRetryable: number;
  } {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<PhonePeErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      retryable: 0,
      nonRetryable: 0
    };

    // Initialize counters
    Object.values(PhonePeErrorType).forEach(type => {
      stats.byType[type] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });

    // Count errors
    this.errorLog.forEach(error => {
      stats.byType[error.type]++;
      stats.bySeverity[error.severity]++;
      if (error.retryable) {
        stats.retryable++;
      } else {
        stats.nonRetryable++;
      }
    });

    return stats;
  }

  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  // Get recent errors
  public getRecentErrors(count: number = 10): PhonePeIntegrationError[] {
    return this.errorLog.slice(-count);
  }
}

// Utility functions
export function isPhonePeError(error: any): error is PhonePeIntegrationError {
  return error instanceof PhonePeIntegrationError;
}

export function isRetryableError(error: any): boolean {
  if (isPhonePeError(error)) {
    return error.retryable;
  }
  return false;
}

export function getErrorSeverity(error: any): ErrorSeverity {
  if (isPhonePeError(error)) {
    return error.severity;
  }
  return ErrorSeverity.UNKNOWN_ERROR;
}

export function shouldLogError(error: any): boolean {
  if (isPhonePeError(error)) {
    return error.severity !== ErrorSeverity.LOW;
  }
  return true;
}

// Error response formatter for API responses
export function formatErrorResponse(error: PhonePeIntegrationError): {
  error: string;
  details: string;
  code?: string;
  httpStatusCode?: number;
  retryable: boolean;
  severity: string;
} {
  return {
    error: error.type,
    details: error.message,
    code: error.code,
    httpStatusCode: error.httpStatusCode,
    retryable: error.retryable,
    severity: error.severity
  };
}

// Export singleton instance
export const phonePeErrorHandler = PhonePeErrorHandler.getInstance();
