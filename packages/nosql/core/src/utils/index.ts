/**
 * Get the name of a class or function
 */
export function nameof<T>(obj: T): string {
  if (typeof obj === 'function') {
    return obj.name;
  }
  if (obj && typeof obj === 'object') {
    return obj.constructor.name;
  }
  return String(obj);
}

/**
 * Generate a unique reference for transactions
 */
export function generateReference(prefix = 'TXN'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[],
): void {
  const missingFields = requiredFields.filter((field) => !obj[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T = unknown>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError!;
}

/**
 * Sanitize metadata to ensure it's JSON-serializable
 */
export function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'function') {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

/**
 * Convert Date to ISO string or return existing string
 */
export function toISOString(date: Date | string | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

/**
 * Parse date from string or return Date object
 */
export function parseDate(date: Date | string | undefined): Date | undefined {
  if (!date) {
    return undefined;
  }
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}
