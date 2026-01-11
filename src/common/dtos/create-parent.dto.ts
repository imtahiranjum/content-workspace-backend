import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class CreateAuditDto {
  @IsNotEmpty()
  @IsUUID()
  @IsOptional()
  createdBy: UserEntity;
}
