import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema, SessionSchemaClass } from './entities/session.schema';
import { SessionDocumentRepository } from './repositories/session.repository';
import { SessionRepository } from '../session.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SessionSchemaClass.name, schema: SessionSchema },
    ]),
  ],
  providers: [
    {
      provide: SessionRepository,
      useClass: SessionDocumentRepository,
    },
  ],
  exports: [SessionRepository],
})
export class DocumentSessionPersistenceModule {}
