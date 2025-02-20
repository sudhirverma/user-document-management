import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { NullableType } from '../../../../../utils/types/nullable.type';
import { SessionSchemaClass } from '../entities/session.schema';
// biome-ignore lint/style/useImportType: <explanation>
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  sessionToDomain,
  sessionToPersistence,
} from '../mappers/session.mapper';
// biome-ignore lint/style/useImportType: <explanation>
import { User } from '../../../../../users/domain/user';
// biome-ignore lint/style/useImportType: <explanation>
import { SessionRepository } from '../../session.repository';
// biome-ignore lint/style/useImportType: <explanation>
import { Session } from 'src/session/domain/session';

@Injectable()
export class SessionDocumentRepository implements SessionRepository {
  constructor(
    @InjectModel(SessionSchemaClass.name)
    private sessionModel: Model<SessionSchemaClass>,
  ) {}

  async findById(id: Session['id']): Promise<NullableType<Session>> {
    const sessionObject = await this.sessionModel.findById(id);
    return sessionObject ? sessionToDomain(sessionObject) : null;
  }

  async create(data: Session): Promise<Session> {
    const persistenceModel = sessionToPersistence(data);
    const createdSession = new this.sessionModel(persistenceModel);
    const sessionObject = await createdSession.save();
    return sessionToDomain(sessionObject);
  }

  async update(
    id: Session['id'],
    payload: Partial<Session>,
  ): Promise<Session | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;
    delete clonedPayload.createdAt;
    delete clonedPayload.updatedAt;
    delete clonedPayload.deletedAt;

    const filter = { _id: id.toString() };
    const session = await this.sessionModel.findOne(filter);

    if (!session) {
      return null;
    }

    const sessionObject = await this.sessionModel.findOneAndUpdate(
      filter,
      sessionToPersistence({
        ...sessionToDomain(session),
        ...clonedPayload,
      }),
      { new: true },
    );

    return sessionObject ? sessionToDomain(sessionObject) : null;
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.sessionModel.deleteOne({ _id: id.toString() });
  }

  async deleteByUserId({ userId }: { userId: User['id'] }): Promise<void> {
    await this.sessionModel.deleteMany({ user: userId.toString() });
  }

  async deleteByUserIdWithExclude({
    userId,
    excludeSessionId,
  }: {
    userId: User['id'];
    excludeSessionId: Session['id'];
  }): Promise<void> {
    const transformedCriteria = {
      user: userId.toString(),
      _id: { $not: { $eq: excludeSessionId.toString() } },
    };
    await this.sessionModel.deleteMany(transformedCriteria);
  }
}
