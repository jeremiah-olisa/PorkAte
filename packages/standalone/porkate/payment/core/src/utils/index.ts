/**
 * Utility functions for payment operations
 */

import { Currency, Money } from '../types';

/**
 * Convert amount from major units to minor units (e.g., Naira to Kobo)
 * @param amount - Amount in major units
 * @param currency - Currency code
 * @returns Amount in minor units
 */
export function toMinorUnits(amount: number, currency: Currency): number {
  // Most currencies use 2 decimal places
  const decimalPlaces = getDecimalPlaces(currency);
  return Math.round(amount * Math.pow(10, decimalPlaces));
}

/**
 * Convert amount from minor units to major units (e.g., Kobo to Naira)
 * @param amount - Amount in minor units
 * @param currency - Currency code
 * @returns Amount in major units
 */
export function toMajorUnits(amount: number, currency: Currency): number {
  const decimalPlaces = getDecimalPlaces(currency);
  return amount / Math.pow(10, decimalPlaces);
}

/**
 * Get the number of decimal places for a currency
 * @param currency - Currency code
 * @returns Number of decimal places
 */
export function getDecimalPlaces(currency: Currency): number {
  // Most currencies use 2 decimal places
  // Add exceptions here if needed
  switch (currency) {
    default:
      return 2;
  }
}

/**
 * Create a Money object from major units
 * @param amount - Amount in major units
 * @param currency - Currency code
 * @returns Money object
 */
export function createMoney(amount: number, currency: Currency): Money {
  return {
    amount: toMinorUnits(amount, currency),
    currency,
  };
}

/**
 * Format money for display
 * @param money - Money object
 * @returns Formatted string
 */
export function formatMoney(money: Money): string {
  const amount = toMajorUnits(money.amount, money.currency);
  return `${money.currency} ${amount.toFixed(getDecimalPlaces(money.currency))}`;
}

/**
 * Generate a random reference
 * @param prefix - Optional prefix for the reference
 * @returns Random reference string
 */
export function generateReference(prefix: string = 'TXN'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate email address
 * @param email - Email to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function nameof(name: string): string;
export function nameof<T>(expr: () => T): string;
// eslint-disable-next-line @typescript-eslint/ban-types
export function nameof(fn: Function): string;
export function nameof(fn: object): string;
// eslint-disable-next-line @typescript-eslint/ban-types
/**
 * Returns a best-effort "name" for the provided argument.
 *
 * Supports the following inputs and extraction strategies (in priority order):
 * 1. string: returns the string unchanged.
 * 2. function: attempts to extract a referenced property name from common function forms
 *    (e.g. `() => obj.prop`, `() => obj['prop']`, or `function() { return obj.prop; }`) using
 *    a regular expression. If that fails, returns the function or class name (if present).
 * 3. object/instance: returns the object's constructor name when available.
 * 4. fallback: coerces the value to a string (`String(arg ?? '')`) as a last resort.
 *
 * Notes and limitations:
 * - Property extraction from functions uses source-text matching and can fail for minified,
 *   transpiled, or otherwise transformed code. It only handles simple dot and bracket property access.
 * - Anonymous functions or expressions that do not reference a property may return an empty string.
 * - The returned constructor name depends on runtime constructor.name support and may be altered
 *   by minification or class renaming.
 *
 * @typeParam T - optional generic used to describe the type returned by function arguments; not used for runtime behavior.
 * @param arg - the value to derive a name from. Can be a string, a function, or an object/instance.
 * @returns a string representing the derived name, or an empty string when no sensible name can be determined.
 *
 * @example
 * // Simple string
 * nameof('prop') // -> 'prop'
 *
 * @example
 * // From a property accessor function
 * nameof(() => obj.prop) // -> 'prop'
 * nameof(() => obj['prop']) // -> 'prop'
 *
 * @example
 * // From a class or function
 * class MyClass {}
 * nameof(MyClass) // -> 'MyClass'
 * nameof(new MyClass()) // -> 'MyClass'
 *
 * @example
 * // Fallbacks
 * nameof(() => {}) // -> '' (anonymous function with no property access)
 * nameof(null) // -> 'null'
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function nameof<T = unknown>(arg: string | object | (() => T) | Function): string {
  if (typeof arg === 'string') {
    return arg;
  }

  if (typeof arg === 'function') {
    const fnStr = arg?.toString();

    // Try to extract property name from expressions like:
    //  () => obj.prop
    //  () => obj['prop']
    //  function() { return obj.prop; }
    const propMatch = fnStr?.match(
      /(?:return\s+|=>\s*)(?:.*?\[['"]([^'"]+)['"]|.*?\.([A-Za-z_$][A-Za-z0-9_$]*))/,
    );
    if (propMatch) {
      return propMatch[1] || propMatch[2];
    }

    // Fall back to function/class name if present
    if (arg?.name) {
      return arg?.name;
    }

    return '';
  }

  // If an instance/object is passed, return its constructor name when available
  if (arg && typeof arg === 'object' && arg?.constructor && arg?.constructor?.name) {
    return arg?.constructor?.name;
  }

  return String(arg ?? '');
}
