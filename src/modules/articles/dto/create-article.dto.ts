import { IsEnum, IsString } from "class-validator";
import { ArticleStatus } from "src/common/enums/article-status.enum";

export class CreateArticleDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsEnum(ArticleStatus)
    status: ArticleStatus;
}
