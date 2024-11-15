// src/utils/errors.ts
import { analytics } from './analytics';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', context);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'STORAGE_ERROR', context);
    this.name = 'StorageError';
  }
}

export const handleError = (error: Error | AppError, context?: string): void => {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    analytics.trackError(error, context);
  } else {
    analytics.trackError(
      new AppError(error.message, 'UNKNOWN_ERROR', {
        originalError: error,
        context,
      })
    );
  }
};
