/**
 * Utility functions for storage operations
 */

/**
 * Generate a random key for file storage
 * @param prefix - Optional prefix for the key
 * @param extension - Optional file extension
 * @returns Random key string
 */
export function generateKey(prefix: string = 'FILE', extension?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const key = `${prefix}_${timestamp}_${random}`;
  return extension ? `${key}.${extension}` : key;
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string
 */
export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Extract file extension from filename
 * @param filename - Filename to extract extension from
 * @returns File extension (without dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Sanitize filename for safe storage
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Validate file key/path
 * @param key - Key to validate
 * @returns Whether the key is valid
 */
export function isValidKey(key: string): boolean {
  // Key should not be empty, should not start/end with slash, no double slashes
  return (
    !!key &&
    key.length > 0 &&
    !key.startsWith('/') &&
    !key.endsWith('/') &&
    !key.includes('//')
  );
}

/**
 * Normalize path separators
 * @param path - Path to normalize
 * @returns Normalized path
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
}

/**
 * Get MIME type from file extension
 * @param filename - Filename or extension
 * @returns MIME type
 */
export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    
    // Video
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    
    // Code
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
  };

  return mimeTypes[ext] || 'application/octet-stream';
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
    // First try bracket notation
    const bracketMatch = fnStr?.match(/\[['"]([^'"]+)['"]\]/);
    if (bracketMatch) {
      return bracketMatch[1];
    }

    // Then try dot notation - match the last property access
    const dotMatch = fnStr?.match(/\.([A-Za-z_$][A-Za-z0-9_$]*)(?:\s*\)|$)/);
    if (dotMatch) {
      return dotMatch[1];
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
