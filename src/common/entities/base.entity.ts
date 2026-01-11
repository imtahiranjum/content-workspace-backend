import { Column, Generated, PrimaryGeneratedColumn } from 'typeorm';
import { Audit } from './audit.entity';

export abstract class CustomBaseEntity extends Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('increment')
  displayOrderId: number;
}

export abstract class CustomBaseEntityWithoutAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Generated('increment')
  displayOrderId: number;
}
