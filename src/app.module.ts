import { Module } from '@nestjs/common';
import type { DatabaseConfig } from './database/config/database-config.type';
import databaseConfig from './database/config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { ConfigModule } from '@nestjs/config';

// Determine which database module to use based on the configuration
const infrastructureDatabaseModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? // If the database is a document database (e.g., MongoDB), use MongooseModule
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService, // Use a custom configuration service for Mongoose
    })
  : // Otherwise, use TypeOrmModule for relational databases
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService, // Use a custom configuration service for TypeORM
      dataSourceFactory: async (options: DataSourceOptions) => {
        // Initialize the data source for TypeORM with the provided options
        return new DataSource(options).initialize();
      },
    });

@Module({
  imports: [
    // Load configuration module globally
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration accessible throughout the application
      load: [databaseConfig], // Loads the database configuration
      envFilePath: ['.env'], // Specifies the environment file to load variables from
    }),
    infrastructureDatabaseModule, // Dynamically import the appropriate database module
  ],
})
export class AppModule {}
