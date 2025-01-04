import { registerAs } from '@nestjs/config';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  ValidateIf,
  IsBoolean,
} from 'class-validator'; // Import validation decorators from class-validator
import validateConfig from '../../utils/validate-config'; // Utility function to validate configuration
import type { DatabaseConfig } from './database-config.type'; // Type for the database configuration

// Validator class for environment variables related to database configuration
class EnvironmentVariablesValidator {
  // DATABASE_URL is required if it's set in the environment variables
  @ValidateIf((envValues) => envValues.DATABASE_URL)
  @IsString() // Ensures the value is a string
  DATABASE_URL: string;

  // If DATABASE_URL is not provided, DATABASE_TYPE must be provided
  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString() // Ensures the value is a string
  DATABASE_TYPE: string;

  // If DATABASE_URL is not set, DATABASE_HOST is required
  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString() // Ensures the value is a string
  DATABASE_HOST: string;

  // DATABASE_PORT is required if DATABASE_URL is not set
  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsInt() // Ensures the value is an integer
  @Min(0) // Minimum value for port is 0
  @Max(65535) // Maximum value for port is 65535 (valid port range)
  DATABASE_PORT: number;

  // If DATABASE_URL is not provided, DATABASE_PASSWORD must be provided
  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString() // Ensures the value is a string
  DATABASE_PASSWORD: string;

  // If DATABASE_URL is not provided, DATABASE_NAME is required
  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString() // Ensures the value is a string
  DATABASE_NAME: string;

  // If DATABASE_URL is not provided, DATABASE_USERNAME is required
  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString() // Ensures the value is a string
  DATABASE_USERNAME: string;

  // Optionally specifies whether to synchronize the database schema on startup
  @IsBoolean() // Ensures the value is a boolean
  @IsOptional() // This field is optional
  DATABASE_SYNCHRONIZE: boolean;

  // Optionally specifies the maximum number of database connections
  @IsInt() // Ensures the value is an integer
  @IsOptional() // This field is optional
  DATABASE_MAX_CONNECTIONS: number;

  // Optionally specifies whether SSL should be enabled for database connections
  @IsBoolean() // Ensures the value is a boolean
  @IsOptional() // This field is optional
  DATABASE_SSL_ENABLED: boolean;

  // Optionally specifies whether to reject unauthorized SSL certificates
  @IsBoolean() // Ensures the value is a boolean
  @IsOptional() // This field is optional
  DATABASE_REJECT_UNAUTHORIZED: boolean;

  // Optionally specifies the path to the database's SSL certificate authority (CA)
  @IsString() // Ensures the value is a string
  @IsOptional() // This field is optional
  DATABASE_CA: string;

  // Optionally specifies the path to the database's SSL private key
  @IsString() // Ensures the value is a string
  @IsOptional() // This field is optional
  DATABASE_KEY: string;

  // Optionally specifies the path to the database's SSL certificate
  @IsString() // Ensures the value is a string
  @IsOptional() // This field is optional
  DATABASE_CERT: string;
}

// Register and validate the configuration for the 'database' module
export default registerAs<DatabaseConfig>('database', () => {
  // Validate the environment variables using the EnvironmentVariablesValidator class
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    // Determine if the database type is a document database (MongoDB)
    isDocumentDatabase: ['mongodb'].includes(process.env.DATABASE_TYPE ?? ''),

    // Return the database configuration from environment variables
    url: process.env.DATABASE_URL,
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? Number.parseInt(process.env.DATABASE_PORT, 10) // Convert string to number
      : 5432, // Default port is 5432 (PostgreSQL)
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,

    // Convert string 'true'/'false' to boolean for synchronization option
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',

    // Set the maximum number of connections, defaulting to 100 if not set
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS
      ? Number.parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100, // Default max connections is 100
    sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true', // Enable SSL if true
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true', // Reject unauthorized certificates if true
    ca: process.env.DATABASE_CA, // Path to CA certificate
    key: process.env.DATABASE_KEY, // Path to private key
    cert: process.env.DATABASE_CERT, // Path to SSL certificate
  };
});
