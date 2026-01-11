import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/enums/role.enum';
import { Repository } from 'typeorm';
import { ArticleEntity } from './entities/article.entity';
import { ArticleStatus } from 'src/common/enums/article-status.enum';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
  ) {}

  async create(dto: CreateArticleDto, userId: string) {
    const article = this.articleRepository.create({
      ...dto,
      publishDate: dto.status === ArticleStatus.PUBLISHED ? new Date() : null,
      author: { id: userId },
    });
    return this.articleRepository.save(article);
  }

  async update(id: string, dto: UpdateArticleDto, user) {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) throw new NotFoundException();

    if (user.role !== Role.ADMIN && article.author.id !== user.id) {
      throw new ForbiddenException();
    }

    Object.assign(article, dto);
    return this.articleRepository.save(article);
  }

  async delete(id: string) {
    return this.articleRepository.delete(id);
  }

  findPublished() {
    return this.articleRepository.find({
      where: { status: ArticleStatus.PUBLISHED },
      relations: ['author'],
    });
  }

  findById(id: string) {
    return this.articleRepository.findOne({
      where: { id },
    });
  }

  findByAuthor(authorId: string) {
    return this.articleRepository.find({
      where: { author: { id: authorId } },
      relations: ['author'],
    });
  }
}
