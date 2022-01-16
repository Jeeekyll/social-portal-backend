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
import { FollowEntity } from '../profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    private readonly fileService: FileService,
  ) {
  }

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
      queryBuilder.andWhere('articles.title LIKE :title', {
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

    const currentUser = await this.userRepository.findOne(
      { id: userId },
      { relations: ['favourites'] },
    );

    if (currentUser) {
      const followedByCurrentUser = await this.followRepository.find({
        where: { followerId: currentUser.id },
        select: ['followingId'],
      });

      const articleWithFollowed = articles.map((article: any) => {
        article.author.following =
          followedByCurrentUser.findIndex(
            (follower) => follower.followingId === article.author.id,
          ) !== -1;

        article.isFavourite =
          currentUser.favourites.findIndex((item) => item.id === article.id) !== -1;

        return article;
      });

      return {
        articles: articleWithFollowed,
        articlesCount,
      };
    }

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

  async findOne(slug: string, currentUserId: number) {
    const currentUser = await this.userRepository.findOne(currentUserId, {
      relations: ['favourites'],
    });

    const article = await getRepository(ArticleEntity)
      .createQueryBuilder('article')
      .where('article.slug = :slug', { slug })
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .orderBy('comments.createdAt', 'DESC')
      .getOne();

    //check is user liked current article
    const isArticleFavourite =
      currentUser.favourites.findIndex((item) => item.id === article.id) !== -1;

    return {
      ...article,
      isFavourite: isArticleFavourite,
    };
  }

  async deleteArticle(slug: string, userId: number) {
    const articleBySlug = await this.articleRepository.findOne({ slug });

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

    const articleWithFollowings = await this.buildArticleWithFollowings(
      author,
      article,
    );

    return {
      ...articleWithFollowings,
      isFavourite: true,
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

    const articleWithFollowings = await this.buildArticleWithFollowings(
      author,
      article,
    );

    return {
      ...articleWithFollowings,
      isFavourite: false,
    };
  }

  private async buildArticleWithFollowings(
    user: UserEntity,
    article: any,
  ): Promise<ArticleEntity> {
    const followedByCurrentUser = await this.followRepository.find({
      where: { followerId: user.id },
      select: ['followingId'],
    });

    article.author.following =
      followedByCurrentUser.findIndex(
        (follower) => follower.followingId === article.author.id,
      ) !== -1;

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    const tempSlug =
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);

    return tempSlug.split('.').join('');
  }
}
