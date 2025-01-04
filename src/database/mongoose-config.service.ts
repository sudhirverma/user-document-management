import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import type { AllConfigType } from 'src/config/config.type';

/**
 * Service to configure Mongoose connection options dynamically.
 * Implements the `MongooseOptionsFactory` interface from NestJS to provide configuration options.
 */
@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  /**
   * Injects the `ConfigService` to access environment-specific database configuration values.
   *
   * @param {ConfigService<AllConfigType>} configService - The service used to fetch configuration values.
   */
  constructor(private configService: ConfigService<AllConfigType>) {}

  /**
   * Creates Mongoose configuration options.
   * This method is called by the NestJS Mongoose module to establish a database connection.
   *
   * @returns {MongooseModuleOptions} - Configuration options for Mongoose.
   */
  createMongooseOptions(): MongooseModuleOptions {
    return {
      // The URI for connecting to the MongoDB server, fetched from configuration
      uri: this.configService.get('database.url', { infer: true }),

      // The database name to connect to
      dbName: this.configService.get('database.name', { infer: true }),

      // Authentication credentials for the database
      user: this.configService.get('database.username', { infer: true }),
      pass: this.configService.get('database.password', { infer: true }),

      /**
       * A factory function to customize the connection after it is established.
       * Adds the `mongoose-autopopulate` plugin to the connection.
       *
       * @param {mongoose.Connection} connection - The established Mongoose connection.
       * @returns {mongoose.Connection} - The modified connection with the plugin applied.
       */
      connectionFactory(connection) {
        connection.plugin(mongooseAutoPopulate); // Automatically populates referenced documents.
        return connection; // Return the modified connection object.
      },
    };
  }
}
