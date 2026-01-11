import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class UpdateAuditDto {
  @IsNotEmpty()
  @IsString()
  updatedBy: UserEntity;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  updatedById?: string;
}
