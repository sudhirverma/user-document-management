// biome-ignore lint/style/useImportType: <explanation>
import { Session } from '../../../session/domain/session';
// biome-ignore lint/style/useImportType: <explanation>
import { User } from '../../../users/domain/user';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
