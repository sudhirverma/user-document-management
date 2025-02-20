import {
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import ms from 'ms';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
// biome-ignore lint/style/useImportType: <explanation>
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
// biome-ignore lint/style/useImportType: <explanation>
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
// biome-ignore lint/style/useImportType: <explanation>
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
// biome-ignore lint/style/useImportType: <explanation>
import { NullableType } from '../utils/types/nullable.type';
// biome-ignore lint/style/useImportType: <explanation>
import { LoginResponseDto } from './dto/login-response.dto';
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: <explanation>
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
// biome-ignore lint/style/useImportType: <explanation>
import { UsersService } from '../users/users.service';
// biome-ignore lint/style/useImportType: <explanation>
import { AllConfigType } from '../config/config.type';
import { RoleEnum } from '../roles/roles.enum';
// biome-ignore lint/style/useImportType: <explanation>
import { Session } from '../session/domain/session';
// biome-ignore lint/style/useImportType: <explanation>
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../statuses/statuses.enum';
// biome-ignore lint/style/useImportType: <explanation>
import { User } from '../users/domain/user';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private sessionService: SessionService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          email: 'notFound',
        },
      });
    }

    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrectPassword',
        },
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const session = await this.sessionService.create({
      user,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    await this.usersService.create({
      ...dto,
      email: dto.email,
      role: {
        id: RoleEnum.user,
      },
      status: {
        id: StatusEnum.inactive,
      },
    });
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findById(data.sessionId);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException();
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.usersService.findById(session.user.id);

    if (!user?.role) {
      throw new UnauthorizedException();
    }

    await this.sessionService.update(session.id, {
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: {
        id: user.role.id,
      },
      sessionId: session.id,
      hash,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.deleteById(data.sessionId);
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
    hash: Session['hash'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
