import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserSchemaClass } from './entities/user.schema';
import { UserRepository } from '../user.repository';
import { UsersDocumentRepository } from './repositories/user.repository';

/**
 * Module responsible for managing user persistence using MongoDB.
 * This module uses Mongoose for Object Data Mapping (ODM).
 */
@Module({
  imports: [
    // Register the Mongoose schema for the User collection
    MongooseModule.forFeature([
      {
        name: UserSchemaClass.name, // The name of the model, derived from the schema class
        schema: UserSchema, // The schema defining the structure of User documents
      },
    ]),
  ],
  providers: [
    {
      provide: UserRepository, // Token for the UserRepository interface
      useClass: UsersDocumentRepository, // Concrete implementation using MongoDB
    },
  ],
  exports: [
    UserRepository, // Export UserRepository for use in other modules
  ],
})
export class DocumentUserPersistenceModule {}
