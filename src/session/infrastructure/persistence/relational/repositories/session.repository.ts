import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// biome-ignore lint/style/useImportType: <explanation>
import { Not, Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
// biome-ignore lint/style/useImportType: <explanation>
import { NullableType } from '../../../../../utils/types/nullable.type';

// biome-ignore lint/style/useImportType: <explanation>
import { SessionRepository } from '../../session.repository';
// biome-ignore lint/style/useImportType: <explanation>
import { Session } from '../../../../domain/session';

import {
  sessionToDomain,
  sessionToPersistence,
} from '../mappers/session.mapper';
// biome-ignore lint/style/useImportType: <explanation>
import { User } from '../../../../../users/domain/user';

@Injectable()
export class SessionRelationalRepository implements SessionRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async findById(id: Session['id']): Promise<NullableType<Session>> {
    const entity = await this.sessionRepository.findOne({
      where: {
        id: Number(id),
      },
    });

    return entity ? sessionToDomain(entity) : null;
  }

  async create(data: Session): Promise<Session> {
    const persistenceModel = sessionToPersistence(data);
    return this.sessionRepository.save(
      this.sessionRepository.create(persistenceModel),
    );
  }

  async update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    const entity = await this.sessionRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Session not found');
    }

    const updatedEntity = await this.sessionRepository.save(
      this.sessionRepository.create(
        sessionToPersistence({
          ...sessionToDomain(entity),
          ...payload,
        }),
      ),
    );

    return sessionToDomain(updatedEntity);
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.sessionRepository.softDelete({
      id: Number(id),
    });
  }

  async deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: {
        id: Number(conditions.userId),
      },
    });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User['id'];
    excludeSessionId: Session['id'];
  }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: {
        id: Number(conditions.userId),
      },
      id: Not(Number(conditions.excludeSessionId)),
    });
  }
}
