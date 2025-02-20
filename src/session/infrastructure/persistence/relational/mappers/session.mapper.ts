import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { userToDomain } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { Session } from '../../../../domain/session';
import { SessionEntity } from '../entities/session.entity';

export function sessionToDomain(raw: SessionEntity): Session {
  const domainEntity = new Session();
  domainEntity.id = raw.id;
  if (raw.user) {
    domainEntity.user = userToDomain(raw.user);
  }
  domainEntity.hash = raw.hash;
  domainEntity.createdAt = raw.createdAt;
  domainEntity.updatedAt = raw.updatedAt;
  domainEntity.deletedAt = raw.deletedAt;
  return domainEntity;
}

export function sessionToPersistence(domainEntity: Session): SessionEntity {
  const user = new UserEntity();
  user.id = Number(domainEntity.user.id);

  const persistenceEntity = new SessionEntity();
  if (domainEntity.id && typeof domainEntity.id === 'number') {
    persistenceEntity.id = domainEntity.id;
  }
  persistenceEntity.hash = domainEntity.hash;
  persistenceEntity.user = user;
  persistenceEntity.createdAt = domainEntity.createdAt;
  persistenceEntity.updatedAt = domainEntity.updatedAt;
  persistenceEntity.deletedAt = domainEntity.deletedAt;

  return persistenceEntity;
}
