import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type {
  TypeOrmModuleOptions,
  TypeOrmOptionsFactory,
} from '@nestjs/typeorm';
import type { AllConfigType } from 'src/config/config.type';

/**
 * Service to dynamically configure TypeORM connection options based on environment variables.
 * Implements the `TypeOrmOptionsFactory` interface to provide configuration options.
 */
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  /**
   * Injects the `ConfigService` to access environment-specific database configuration values.
   *
   * @param {ConfigService<AllConfigType>} configService - Service for accessing application configurations.
   */
  constructor(private configService: ConfigService<AllConfigType>) {}

  /**
   * Creates TypeORM configuration options.
   * This method is called by the NestJS TypeORM module to establish a database connection.
   *
   * @returns {TypeOrmModuleOptions} - Configuration options for TypeORM.
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      // Database type (e.g., postgres, mysql, sqlite, etc.)
      type: this.configService.get('database.type', { infer: true }),

      // Full database connection string (overrides host, port, etc., if provided)
      url: this.configService.get('database.url', { infer: true }),

      // Hostname of the database server
      host: this.configService.get('database.host', { infer: true }),

      // Port number for the database connection
      port: this.configService.get('database.port', { infer: true }),

      // Username for database authentication
      username: this.configService.get('database.username', { infer: true }),

      // Password for database authentication
      password: this.configService.get('database.password', { infer: true }),

      // Name of the database to connect to
      database: this.configService.get('database.name', { infer: true }),

      // Automatically synchronize database schema with entity definitions (use cautiously in production)
      synchronize: this.configService.get('database.synchronize', {
        infer: true,
      }),

      // Prevent schema from being dropped on initialization
      dropSchema: false,

      // Keep the database connection alive across module reloads
      keepConnectionAlive: true,

      // Enable or disable query logging based on environment
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',

      // Path patterns for locating entity definitions
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],

      // Path patterns for locating migration scripts
      migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],

      // CLI configurations for TypeORM
      cli: {
        entitiesDir: 'src', // Directory containing entity definitions
        subscribersDir: 'subscriber', // Directory containing subscriber definitions
      },

      // Additional options for the database connection
      extra: {
        // Maximum number of connections in the pool
        max: this.configService.get('database.maxConnections', { infer: true }),

        // SSL configuration for secure connections
        ssl: this.configService.get('database.sslEnabled', { infer: true })
          ? {
              rejectUnauthorized: this.configService.get(
                'database.rejectUnauthorized',
                { infer: true },
              ),
              // Optional SSL certificates
              ca:
                this.configService.get('database.ca', { infer: true }) ??
                undefined,
              key:
                this.configService.get('database.key', { infer: true }) ??
                undefined,
              cert:
                this.configService.get('database.cert', { infer: true }) ??
                undefined,
            }
          : undefined,
      },
    } as TypeOrmModuleOptions;
  }
}
