import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    const params = request.params;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const foundUser = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: user.id },
    });

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    if (params?.id && params.id === foundUser.id) {
      return true;
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(foundUser.role);
      if (hasRole) {
        return true;
      }
    }

    if (foundUser.role === Role.ADMIN) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
