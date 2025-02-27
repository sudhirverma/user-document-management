import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';

export function userToDomain(raw: UserEntity): User {
  const domainEntity = new User();
  domainEntity.id = raw.id;
  domainEntity.email = raw.email;
  domainEntity.password = raw.password;
  domainEntity.socialId = raw.socialId;
  domainEntity.firstName = raw.firstName;
  domainEntity.lastName = raw.lastName;
  domainEntity.role = raw.role;
  domainEntity.status = raw.status;
  domainEntity.createdAt = raw.createdAt;
  domainEntity.updatedAt = raw.updatedAt;
  domainEntity.deletedAt = raw.deletedAt;
  return domainEntity;
}

export function userToPersistence(domainEntity: User): UserEntity {
  let role: RoleEntity | undefined = undefined;

  if (domainEntity.role) {
    role = new RoleEntity();
    role.id = Number(domainEntity.role.id);
  }

  let status: StatusEntity | undefined = undefined;

  if (domainEntity.status) {
    status = new StatusEntity();
    status.id = Number(domainEntity.status.id);
  }

  const persistenceEntity = new UserEntity();
  if (domainEntity.id && typeof domainEntity.id === 'number') {
    persistenceEntity.id = domainEntity.id;
  }
  persistenceEntity.email = domainEntity.email;
  persistenceEntity.password = domainEntity.password;
  persistenceEntity.socialId = domainEntity.socialId;
  persistenceEntity.firstName = domainEntity.firstName;
  persistenceEntity.lastName = domainEntity.lastName;
  persistenceEntity.role = role;
  persistenceEntity.status = status;
  persistenceEntity.createdAt = domainEntity.createdAt;
  persistenceEntity.updatedAt = domainEntity.updatedAt;
  persistenceEntity.deletedAt = domainEntity.deletedAt;
  return persistenceEntity;
}
