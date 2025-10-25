/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utility class for parsing stringified objects, particularly for metadata
 */
export class MetadataParser {
  /**
   * Converts a string to an object if it's a valid JSON object string, otherwise wraps the input in { data: value }
   * @param input - The string to parse
   * @returns Parsed object or { data: input } if parsing fails or input is invalid
   */
  static parseToObject<T = Record<string, any>>(input: string): T | { data: string } {
    // Check if input is a string and not empty
    if (typeof input !== 'string' || !input.trim()) {
      return { data: input };
    }

    try {
      // Attempt to parse the string
      const parsed = JSON.parse(input);

      // Verify if parsed result is an object (not array or primitive)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as T;
      }
      return { data: input };
    } catch (error) {
      // Handle parsing errors by wrapping input in { data: input }
      return { data: input };
    }
  }

  /**
   * Safely parses metadata and returns a specific property
   * @param input - The string to parse
   * @param property - The property to extract from the parsed object
   * @returns Value of the specified property or null if not found or parsing fails
   */
  static getMetadataProperty<T = any>(input: string, property: string): T | null {
    const parsedObject = this.parseToObject(input);
    if (
      parsedObject &&
      typeof parsedObject === 'object' &&
      !Array.isArray(parsedObject) &&
      Object.prototype.hasOwnProperty.call(parsedObject, property)
    ) {
      const obj = parsedObject as Record<string, any>;
      return obj[property] as T;
    }
    return null;
  }

  /**
   * Validates if the input string is a valid JSON object string
   * @param input - The string to validate
   * @returns Boolean indicating if the string is a valid JSON object
   */
  static isValidObjectString(input: string): boolean {
    const parsed = this.parseToObject(input);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !('data' in parsed);
  }
}
