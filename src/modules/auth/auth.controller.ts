import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Roles(Role.ADMIN)
  async createUserThroughAdmin(@Body() dto: CreateUserDto) {
    return await this.authService.create(dto, true);
  }

  @Post('signup')
  @Public()
  async create(@Body() dto: CreateUserDto) {
    return await this.authService.create(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.validateLogin(loginDto);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    return await this.authService.refreshToken(refreshToken);
  }
}
