/**
 * Represents the structure of a Role entity in the database.
 * This class can be used to define or manipulate role-related data.
 */
export class RoleSchema {
  /**
   * Unique identifier for the role.
   * Typically corresponds to the `_id` field in MongoDB.
   */
  _id: string;

  /**
   * Name of the role (e.g., "Admin", "User", "Moderator").
   * This field is optional, allowing flexibility for cases where a name may not be required or is dynamically generated.
   */
  name?: string;
}
