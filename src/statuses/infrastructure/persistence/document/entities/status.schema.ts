/**
 * Represents the structure of a Status entity in the database.
 * This class can be used to define or manipulate status-related data.
 */
export class StatusSchema {
  /**
   * Unique identifier for the status.
   * Typically corresponds to the `_id` field in MongoDB.
   */
  _id: string;

  /**
   * Name of the status (e.g., "Active", "Inactive", "Pending").
   * This field is optional, allowing flexibility in cases where a name might not be required.
   */
  name?: string;
}
