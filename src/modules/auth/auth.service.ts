import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { Role } from 'src/common/enums/role.enum';
import { LoginResponse } from 'src/common/interfaces/auth.interfaces';
import { Repository } from 'typeorm';
import { CreateUserByAdminDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from './dto/login-dto';

@Injectable()
export class AuthService {
  private secretKey: string;
  private accessTokenExpiry: StringValue;
  private refreshSecretKey: string;
  private refreshTokenExpiry: StringValue;
  private resetPasswordSecret: string;
  private resetPasswordExpiry: StringValue;
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.secretKey = this.configService.get('authentication.jwtSecret') || '';
    this.accessTokenExpiry =
      this.configService.get('authentication.expiry') || '6H';
    this.refreshSecretKey =
      this.configService.get('authentication.refreshJWTSecret') || '';
    this.refreshTokenExpiry =
      this.configService.get('authentication.refreshExpiry') || '1D';
    this.resetPasswordSecret =
      this.configService.get('authentication.resetPasswordSecret') || '';
    this.resetPasswordExpiry =
      this.configService.get('authentication.resetPasswordExpiry') || '10M';
  }
  async create(
    dto: CreateUserByAdminDto,
    byAdmin: boolean = false,
  ): Promise<LoginResponse> {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: byAdmin ? (dto.role ?? Role.EDITOR) : Role.EDITOR,
    });

    const userSaved = await this.usersRepo.save(user);

    return await this.issueTokensAndBuildResponse(
      userSaved,
      'User created successfully',
    );
  }
  async validateLogin(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    if (!password) throw new UnauthorizedException('Password is required');

    let user: UserEntity | null;

    user = await this.usersRepo.findOne({
      where: { email },
      select: ['id', 'password', 'email', 'role'],
    });

    if (!user?.password) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return await this.issueTokensAndBuildResponse(user, 'Login successful');
  }

  private async issueTokensAndBuildResponse(
    user: any,
    message: string,
  ): Promise<LoginResponse> {
    const token = this.generateToken(
      user,
      this.secretKey,
      this.accessTokenExpiry,
    );
    const refreshToken = this.generateToken(
      user,
      this.refreshSecretKey,
      this.refreshTokenExpiry,
    );

    user.lastLogin = new Date();
    await this.usersRepo.save(user);
    return {
      message,
      accessToken: token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  private generateToken(
    user: Partial<UserEntity>,
    secretKey: string,
    expiry: StringValue,
  ) {
    const issuedAt = Math.floor(Date.now() / 1000);

    return sign(
      {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        iat: issuedAt,
      },
      secretKey,
      {
        expiresIn: expiry,
      },
    );
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const decoded = verify(refreshToken, this.refreshSecretKey) as {
        id: string;
        email: string;
        role: string;
        iat: number;
      }; // Verifying the refresh token
      const user = await this.usersRepo.findOne({
        where: { id: decoded.id },
        relations: ['profile'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access and refresh tokens
      const token = this.generateToken(
        user,
        this.secretKey,
        this.accessTokenExpiry,
      );

      const newRefreshToken = this.generateToken(
        user,
        this.refreshSecretKey,
        this.refreshTokenExpiry,
      );

      return {
        message: 'Token refreshed successfully',
        accessToken: token,
        refreshToken: newRefreshToken,
        user: {
          name: user?.name,
          email: user?.email,
          id: user?.id,
          role: user?.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
