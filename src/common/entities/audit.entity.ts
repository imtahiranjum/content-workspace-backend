import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  AfterSoftRemove,
  AfterUpdate,
  Column,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export abstract class Audit {
  @Column({ default: false, select: false })
  isSystemCreated: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  updatedBy: UserEntity;

  @Column({ nullable: true })
  deletedById: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'deletedById' })
  deletedBy: UserEntity;

  @AfterUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @AfterSoftRemove()
  removeTimestamp() {
    this.updatedAt = new Date();
  }

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
