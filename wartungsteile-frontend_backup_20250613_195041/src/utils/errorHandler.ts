/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  timestamp: Date;
  requestId?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and log errors
   */
  handleError(error: any, context?: string): AppError {
    const appError: AppError = {
      message: this.getErrorMessage(error),
      code: error.code || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || error.status,
      details: error.response?.data || error.details,
      timestamp: new Date(),
      requestId: error.response?.headers?.['x-request-id']
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${context || 'Error'}]`, appError);
    }

    // Store in memory log
    this.errorLog.unshift(appError);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Send to monitoring service (e.g., Sentry)
    this.reportToMonitoring(appError, context);

    return appError;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: any): string {
    // Check for custom user message
    if (error.userMessage) {
      return error.userMessage;
    }

    // Check response status
    const status = error.response?.status || error.status;
    switch (status) {
      case 400:
        return 'Die eingegebenen Daten sind ungültig. Bitte überprüfen Sie Ihre Eingaben.';
      case 401:
        return 'Sie sind nicht angemeldet. Bitte melden Sie sich an.';
      case 403:
        return 'Sie haben keine Berechtigung für diese Aktion.';
      case 404:
        return 'Die angeforderte Ressource wurde nicht gefunden.';
      case 409:
        return 'Es besteht ein Konflikt mit dem aktuellen Status. Bitte laden Sie die Seite neu.';
      case 422:
        return 'Die Daten konnten nicht verarbeitet werden. Bitte prüfen Sie Ihre Eingaben.';
      case 500:
        return 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
      case 503:
        return 'Der Service ist momentan nicht verfügbar. Bitte versuchen Sie es später erneut.';
      default:
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          return 'Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.';
        }
        return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Ein unbekannter Fehler ist aufgetreten';
  }

  /**
   * Report error to monitoring service
   */
  private reportToMonitoring(error: AppError, context?: string): void {
    // TODO: Integrate with Sentry or similar
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: { app: { context } },
    //     extra: error.details
    //   });
    // }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(): AppError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * React Hook for error handling
 */
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const appError = errorHandler.handleError(error, context);
    return {
      message: errorHandler.getUserMessage(error),
      error: appError
    };
  };

  return { handleError };
}

/**
 * Format validation errors from API
 */
export function formatValidationErrors(errors: any): string[] {
  if (Array.isArray(errors)) {
    return errors;
  }
  
  if (typeof errors === 'object') {
    return Object.entries(errors).flatMap(([field, messages]) => {
      if (Array.isArray(messages)) {
        return messages.map(msg => `${field}: ${msg}`);
      }
      return [`${field}: ${messages}`];
    });
  }
  
  return ['Validierungsfehler aufgetreten'];
}