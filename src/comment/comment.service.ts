import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './comment.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/createComment.dto';
import { ArticleEntity } from '../article/article.entity';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createCommentDto: CreateCommentDto, author: UserEntity) {
    const articleById = await this.articleRepository.findOne({
      id: createCommentDto.articleId,
    });

    const comment = new CommentEntity();
    Object.assign(comment, {
      text: createCommentDto.text,
    });

    comment.article = articleById;
    comment.author = author;

    return await this.commentRepository.save(comment);
  }

  async delete(commentId: number, author: UserEntity) {
    const commentById = await this.commentRepository.findOne({ id: commentId });

    if (!commentById) {
      throw new HttpException('Wrong comment', HttpStatus.NOT_FOUND);
    }

    if (author.id !== commentById.author.id) {
      throw new HttpException(
        'You are not the author',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.commentRepository.delete({ id: commentId });
    return { data: commentById.id };
  }

  async findArticleComments(id: number) {
    const article = await this.articleRepository.findOne(id);

    return await getRepository(CommentEntity)
      .createQueryBuilder('comments')
      .leftJoinAndSelect('comments.user', 'user')
      .andWhere('comments.articleId = :id', {
        id: article.id,
      })
      .getMany();
  }
}
