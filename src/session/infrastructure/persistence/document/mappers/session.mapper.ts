import { UserSchemaClass } from '../../../../../users/infrastructure/persistence/document/entities/user.schema';
import { userToDomain } from '../../../../../users/infrastructure/persistence/document/mappers/user.mapper';
import { Session } from '../../../../domain/session';
import { SessionSchemaClass } from '../entities/session.schema';

export function sessionToDomain(raw: SessionSchemaClass): Session {
  const domainEntity = new Session();
  domainEntity.id = raw._id.toString();

  if (raw.user) {
    domainEntity.user = userToDomain(raw.user);
  }

  domainEntity.hash = raw.hash;
  domainEntity.createdAt = raw.createdAt;
  domainEntity.updatedAt = raw.updatedAt;
  domainEntity.deletedAt = raw.deletedAt;
  return domainEntity;
}
export function sessionToPersistence(
  domainEntity: Session,
): SessionSchemaClass {
  const persistenceSchema = new UserSchemaClass();
  persistenceSchema._id = domainEntity.user.id.toString();
  const sessionEntity = new SessionSchemaClass();
  if (domainEntity.id && typeof domainEntity.id === 'string') {
    sessionEntity._id = domainEntity.id;
  }
  sessionEntity.user = persistenceSchema;
  sessionEntity.hash = domainEntity.hash;
  sessionEntity.createdAt = domainEntity.createdAt;
  sessionEntity.updatedAt = domainEntity.updatedAt;
  sessionEntity.deletedAt = domainEntity.deletedAt;
  return sessionEntity;
}
