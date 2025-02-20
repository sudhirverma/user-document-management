import { Module } from '@nestjs/common';
import databaseConfig from './database/config/database.config';
import appConfig from './config/app.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';
import type { DatabaseConfig } from './database/config/database-config.type';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import authConfig from './auth/config/auth.config';

// <database-block>
const infrastructureDatabaseModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    })
  : TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    });
// </database-block>

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, appConfig],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
