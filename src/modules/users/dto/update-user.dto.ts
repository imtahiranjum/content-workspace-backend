// users/dto/update-user-role.dto.ts
import { IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
