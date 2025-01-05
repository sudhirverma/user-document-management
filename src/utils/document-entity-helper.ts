import { Transform } from 'class-transformer';

/**
 * EntityDocumentHelper serves as a base class for MongoDB document entities.
 * It provides a transformation mechanism for the `_id` field to ensure its proper representation.
 */
export class EntityDocumentHelper {
  /**
   * MongoDB document ID (`_id`), automatically transformed to a string during serialization.
   * This is necessary because MongoDB typically stores IDs as `ObjectId` objects,
   * which need to be converted to strings for readability or external usage.
   *
   * Transformation logic:
   * - If the `value` object contains the `value` property (common in class-transformer scenarios),
   *   the transformation retrieves the value of `_id` and converts it to a string.
   * - If the value is not accessible, a fallback string of `'unknown value'` is returned.
   *
   * Note:
   * - The transformation applies only during the `toPlain` process (e.g., when converting to JSON).
   * - This addresses issues such as https://github.com/typestack/class-transformer/issues/879,
   *   ensuring compatibility with `class-transformer` in scenarios where `_id` serialization is required.
   */
  @Transform(
    (value) => {
      if ('value' in value) {
        // Accesses the `_id` field from the original object and converts it to a string
        return value.obj[value.key].toString();
      }

      // Fallback value for unexpected cases
      return 'unknown value';
    },
    {
      toPlainOnly: true, // Apply the transformation only during plain object serialization
    },
  )
  public _id: string; // Public property to hold the transformed document ID
}
