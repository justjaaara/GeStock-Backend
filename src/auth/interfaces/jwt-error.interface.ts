export interface JwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError' | 'NotBeforeError';
  message: string;
  expiredAt?: Date;
  date?: Date;
}

export function isJwtError(error: unknown): error is JwtError {
  return (
    error instanceof Error &&
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError')
  );
}
