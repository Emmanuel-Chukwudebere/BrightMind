// src/services/errorService.ts
import { AppError, handleError } from '../utils/errors';
import { analyticsService } from './analyticsService';

class ErrorService {
  private errorListeners: Array<(error: Error) => void> = [];

  handleError(error: Error | AppError, context?: string): void {
    // Log the error
    handleError(error, context);

    // Track the error
    analyticsService.trackError(error, context);

    // Notify listeners
    this.notifyListeners(error);
  }

  addErrorListener(listener: (error: Error) => void): void {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener: (error: Error) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  private notifyListeners(error: Error): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  // Helper methods for common errors
  handleNetworkError(error: Error, context?: string): void {
    this.handleError(new AppError(error.message, 'NETWORK_ERROR', { context }));
  }

  handleAuthError(error: Error, context?: string): void {
    this.handleError(new AppError(error.message, 'AUTH_ERROR', { context }));
  }

  handleValidationError(error: Error, context?: string): void {
    this.handleError(new AppError(error.message, 'VALIDATION_ERROR', { context }));
  }

  handleStorageError(error: Error, context?: string): void {
    this.handleError(new AppError(error.message, 'STORAGE_ERROR', { context }));
  }
}

export const errorService = new ErrorService();
