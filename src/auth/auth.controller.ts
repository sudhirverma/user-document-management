import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: <explanation>
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: <explanation>
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthGuard } from '@nestjs/passport';
// biome-ignore lint/style/useImportType: <explanation>
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.service.register(createUserDto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<void> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }
}
