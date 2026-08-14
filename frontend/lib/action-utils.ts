/** Safe, user-facing errors for server actions. Details remain in server logs. */
export class ActionError extends Error {
  constructor(message: string, public readonly code: string = 'ACTION_FAILED') {
    super(message);
    this.name = 'ActionError';
  }
}

export function requireNonEmptyString(value: unknown, field: string, maxLength = 500): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ActionError(`${field} is required.`, 'VALIDATION_ERROR');
  }
  const cleaned = value.trim();
  if (cleaned.length > maxLength) {
    throw new ActionError(`${field} must be ${maxLength} characters or fewer.`, 'VALIDATION_ERROR');
  }
  return cleaned;
}

export function requirePositiveAmount(value: unknown, field = 'Amount'): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 10_000_000) {
    throw new ActionError(`${field} must be a positive amount no greater than 10,000,000.`, 'VALIDATION_ERROR');
  }
  return Math.round(value * 100) / 100;
}

export function requireDate(value: unknown, field = 'Date'): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ActionError(`${field} must use YYYY-MM-DD.`, 'VALIDATION_ERROR');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ActionError(`${field} is not a valid calendar date.`, 'VALIDATION_ERROR');
  }
  return value;
}

export function requireId(value: unknown, field = 'ID'): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value)) {
    throw new ActionError(`Invalid ${field}.`, 'VALIDATION_ERROR');
  }
  return value;
}

export function reportActionError(action: string, error: unknown): never {
  console.error(`${action} failed`, error);
  if (error instanceof ActionError) throw error;
  if (error instanceof Error && error.message === 'Unauthorized') {
    throw new ActionError('Your session has expired. Please sign in again.', 'UNAUTHORIZED');
  }
  throw new ActionError('We could not complete that request. Please try again.', 'ACTION_FAILED');
}
