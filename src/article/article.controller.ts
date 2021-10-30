import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async create(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.create(
      currentUser,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async findOne(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.findOne(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard)
  async update(
    @User('id') currentUserId: number,
    @Param('slug') articleSlug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.articleService.update(
      articleSlug,
      updateArticleDto,
      currentUserId,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async delete(@User('id') currentUserId: number, @Param('slug') slug: string) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(':slug/cover')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'cover', maxCount: 1 }]))
  async updateCover(
    @User('id') currentUserId: number,
    @UploadedFiles() file,
    @Param('slug') slug: string,
  ) {
    const { cover } = file;
    const article = await this.articleService.updateCover(
      currentUserId,
      slug,
      cover[0],
    );

    return this.articleService.buildArticleResponse(article);
  }
}
