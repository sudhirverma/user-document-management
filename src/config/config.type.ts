import type { AppConfig } from './app-config.type';
import type { AuthConfig } from '../auth/config/auth-config.type';
import type { DatabaseConfig } from '../database/config/database-config.type';
import type { FileConfig } from '../files/config/file-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
};
