import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getRepository, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UserEntity } from '../user/user.entity';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FileService } from '../file/file.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly fileService: FileService,
  ) {}

  async findAll(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .leftJoinAndSelect('articles.category', 'category');

    //Todo fix COMMENTS relation pagination and add them into qb

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });

      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.search) {
      queryBuilder.andWhere('articles.title ILIKE :title', {
        title: `%${query.search}%`,
      });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articlesCount = await queryBuilder.getCount();
    const articles = await queryBuilder.getMany();

    return {
      articles,
      articlesCount,
    };
  }

  async create(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.author = currentUser;
    article.slug = this.getSlug(createArticleDto.title);

    return await this.articleRepository.save(article);
  }

  async findOneArticle(slug: string, currentUserId: number) {
    const currentUser = await this.userRepository.findOne(currentUserId, {
      relations: ['favourites'],
    });

    const likedArticlesRelation = currentUser.favourites.map(
      (article) => article.id,
    );
    const article = await this.articleRepository.findOne({ slug });
    return {
      ...article,
      userFavourites: likedArticlesRelation,
    };
  }

  async findOne(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  async deleteArticle(slug: string, userId: number) {
    const articleBySlug = await this.findOne(slug);

    if (!articleBySlug) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (userId !== articleBySlug.author.id) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async update(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleEntity> {
    const articleBySlug = await this.articleRepository.findOne({ slug });

    if (!articleBySlug) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (userId !== articleBySlug.author.id) {
      throw new HttpException('You are not the author', HttpStatus.FORBIDDEN);
    }

    Object.assign(articleBySlug, updateArticleDto);

    return await this.articleRepository.save(articleBySlug);
  }

  async updateCover(userId: number, slug: string, cover: File) {
    const articleBySlug = await getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.slug = :slug', { slug })
      .getOne();

    if (articleBySlug.author.id !== userId) {
      throw new HttpException('Wrong user', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (articleBySlug.cover) {
      await this.fileService.removeFile(articleBySlug.cover);
    }

    const uploadedImage = await this.fileService.createFile(
      `images/articles/${articleBySlug.id}`,
      cover,
    );
    Object.assign(articleBySlug, { cover: uploadedImage });
    return await this.articleRepository.save(articleBySlug);
  }

  async addArticleToFavourites(slug: string, userId: number) {
    const article = await this.articleRepository.findOne({ slug });
    const author = await this.userRepository.findOne(userId, {
      relations: ['favourites'],
    });

    const isNotLiked =
      author.favourites.findIndex((item) => item.id === article.id) === -1;

    if (isNotLiked) {
      author.favourites.push(article);
      article.favouritesCount++;
      await this.articleRepository.save(article);
      await this.userRepository.save(author);
    }

    const likedArticlesRelation = author.favourites.map(
      (article) => article.id,
    );

    return {
      ...article,
      userFavourites: likedArticlesRelation,
    };
  }

  async deleteArticleFromFavourites(slug: string, userId: number) {
    const article = await this.articleRepository.findOne({ slug });
    const author = await this.userRepository.findOne(userId, {
      relations: ['favourites'],
    });

    const articleIndex = author.favourites.findIndex(
      (item) => item.id === article.id,
    );

    if (articleIndex >= 0) {
      author.favourites.splice(articleIndex, 1);
      article.favouritesCount--;

      await this.articleRepository.save(article);
      await this.userRepository.save(author);
    }

    const likedArticlesRelation = author.favourites.map(
      (article) => article.id,
    );

    return {
      ...article,
      userFavourites: likedArticlesRelation,
    };
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  async buildArticleResponseWithRelations(article: ArticleEntity) {
    //Todo refactor articles comments relation

    const queryBuilder = await getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .where('articles.id = :id', { id: article.id })
      .leftJoinAndSelect('articles.author', 'author')
      .leftJoinAndSelect('articles.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'creator')
      .leftJoinAndSelect('articles.category', 'category')
      .orderBy('comments.createdAt', 'DESC')
      .getOne();

    return { article: queryBuilder };
  }

  private getSlug(title: string): string {
    const tempSlug =
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

    return tempSlug.split('.').join('');
  }
}
