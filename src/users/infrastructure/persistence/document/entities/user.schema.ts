import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, type HydratedDocument } from 'mongoose';

import { EntityDocumentHelper } from 'src/utils/document-entity-helper';
import { StatusSchema } from 'src/statuses/infrastructure/persistence/document/entities/status.schema';
import { RoleSchema } from 'src/roles/infrastructure/persistence/document/entities/role.schema';

// Type alias for the Mongoose document type associated with the User schema
export type UserSchemaDocument = HydratedDocument<UserSchemaClass>;

/**
 * UserSchemaClass defines the structure and behavior of User documents stored in MongoDB.
 * This schema is enhanced with Mongoose features like timestamps, virtuals, and getters.
 */
@Schema({
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  toJSON: {
    virtuals: true, // Include virtual fields when converting documents to JSON
    getters: true, // Apply getter methods on JSON output
  },
})
export class UserSchemaClass extends EntityDocumentHelper {
  /**
   * Email address of the user.
   * Unique to each user and stored as a string.
   */
  @Prop({
    type: String,
    unique: true, // Ensures uniqueness at the database level
  })
  email: string | null;

  /**
   * Hashed password of the user.
   * Optional field, as it may not be required for certain authentication methods.
   */
  @Prop()
  password?: string;

  /**
   * Social ID of the user, used for social login authentication.
   * Defaults to `null` if not set.
   */
  @Prop({
    type: String,
    default: null,
  })
  socialId?: string | null;

  /**
   * First name of the user.
   * Stored as a string and cannot be `undefined`.
   */
  @Prop({
    type: String,
  })
  firstName: string | null;

  /**
   * Last name of the user.
   * Stored as a string and cannot be `undefined`.
   */
  @Prop({
    type: String,
  })
  lastName: string | null;

  /**
   * Role associated with the user.
   * References the `RoleSchema` and can be `null` if not assigned.
   */
  @Prop({
    type: RoleSchema,
  })
  role?: RoleSchema | null;

  /**
   * Status associated with the user.
   * References the `StatusSchema`.
   */
  @Prop({
    type: StatusSchema,
  })
  status?: StatusSchema;

  /**
   * Date and time when the user was created.
   * Defaults to the current date and time.
   */
  @Prop({ default: now })
  createdAt: Date;

  /**
   * Date and time when the user was last updated.
   * Defaults to the current date and time.
   */
  @Prop({ default: now })
  updatedAt: Date;

  /**
   * Date and time when the user was soft-deleted.
   * Can be `null` if the user has not been deleted.
   */
  @Prop()
  deletedAt: Date;
}

// Creates the Mongoose schema for the UserSchemaClass
export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);

// Adds an index to optimize queries filtering by the role's `_id` field
UserSchema.index({ 'role._id': 1 });
