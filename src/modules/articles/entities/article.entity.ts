import { CustomBaseEntity } from 'src/common/entities/base.entity';
import { ArticleStatus } from 'src/common/enums/article-status.enum';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('articles')
export class ArticleEntity extends CustomBaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({ type: 'timestamptz', nullable: true })
  publishDate: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.articles)
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;
}
