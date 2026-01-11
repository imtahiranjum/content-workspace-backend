import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public';
import { User } from 'src/common/decorators/request-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';
import type { ReqUser } from 'src/common/interfaces/auth.interfaces';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  create(@User() reqUser: ReqUser, @Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto, reqUser.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Put(':id')
  update(
    @Param('id') id: string,
    @User() reqUser: ReqUser,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, dto, reqUser);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.articlesService.delete(id);
  }
  
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  findMyArticles(@User() reqUser: ReqUser) {
    console.log(reqUser);

    return this.articlesService.findByAuthor(reqUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }

  @Public()
  @Get()
  findAll() {
    return this.articlesService.findPublished();
  }
}
