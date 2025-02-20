import { Module } from '@nestjs/common';

import { SessionService } from './session.service';
// biome-ignore lint/style/useImportType: <explanation>
import { DatabaseConfig } from '../database/config/database-config.type';
import databaseConfig from '../database/config/database.config';
import { DocumentSessionPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { RelationalSessionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

// <database-block>
const infrastructurePersistenceModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? DocumentSessionPersistenceModule
  : RelationalSessionPersistenceModule;
// </database-block>

@Module({
  imports: [infrastructurePersistenceModule],
  providers: [SessionService],
  exports: [SessionService, infrastructurePersistenceModule],
})
export class SessionModule {}
