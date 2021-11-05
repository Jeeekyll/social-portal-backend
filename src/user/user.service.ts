import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, getRepository, Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FileService } from '../file/file.service';
import { hash } from 'bcrypt';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ArticleEntity } from '../article/article.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly fileService: FileService,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne(
      { email: loginUserDto.email },
      { select: ['id', 'username', 'bio', 'email', 'image', 'password'] },
    );

    if (!user) {
      throw new HttpException(
        'User not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Wrong credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    delete user.password;
    return user;
  }

  async update(
    id: number | string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const userById = await this.userRepository.findOne(id);

    Object.assign(userById, updateUserDto);
    return await this.userRepository.save(userById);
  }

  async uploadAvatar(userId: number, image): Promise<UserEntity> {
    const userById = await this.userRepository.findOne(userId);

    //remove previous image
    if (userById.image) {
      await this.fileService.removeFile(userById.image);
    }

    const uploadedImage = await this.fileService.createFile(
      `images/users/${userById.id}`,
      image,
    );
    Object.assign(userById, { image: uploadedImage });
    return await this.userRepository.save(userById);
  }

  async removeAvatar(userId: string | number) {
    const userById = await this.userRepository.findOne(userId);
    const isAvatarRemoved = await this.fileService.removeFile(userById.image);

    if (!isAvatarRemoved) {
      throw new HttpException(
        `Can't remove avatar`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    Object.assign(userById, { image: '' });
    return await this.userRepository.save(userById);
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId) {
    const userById = await this.userRepository.findOne(userId);
    const isPasswordCorrect = await this.checkPassword(
      userById,
      changePasswordDto.currentPassword,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Wrong credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (changePasswordDto.newPassword) {
      userById.password = await hash(changePasswordDto.newPassword, 10);
    }

    await this.userRepository.save(userById);
    return { data: true };
  }

  async checkPassword(user: UserEntity, password: string) {
    const userById = await this.userRepository.findOne(user.id, {
      select: ['id', 'username', 'password'],
    });

    const isPasswordCorrect = await compare(password, userById.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Wrong credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return { data: isPasswordCorrect };
  }

  async findUserArticles(userId: number) {
    const userById = await this.userRepository.findOne(userId);

    if (!userById) {
      throw new HttpException(
        'Wrong credentials',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const articles = await getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .where('articles.authorId = :id', { id: userById.id })
      .getMany();

    return { articles };
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJwt(user),
      },
    };
  }

  generateJwt(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }
}
