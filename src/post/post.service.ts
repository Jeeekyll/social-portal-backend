import { HttpException, HttpStatus, Injectable, Post } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/createPost.dto';
import { UpdatePostDto } from './dto/updatePost.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async getPosts() {
    return await this.postRepository.find();
  }

  async getSingle(postId: number) {
    return await this.postRepository.findOne(postId);
  }

  async create(createPostDto: CreatePostDto) {
    return await this.postRepository.save(createPostDto);
  }

  async delete(postId: number) {
    const postById = await this.postRepository.findOne(postId);

    if (!postById) {
      throw new HttpException(
        {
          errors: 'Wrong id',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return await this.postRepository.remove(postById);
  }

  async update(postId: number, updatePostDto: UpdatePostDto) {
    const postById = await this.postRepository.findOne(postId);
    Object.assign(postById, updatePostDto);
    return await this.postRepository.save(postById);
  }
}
