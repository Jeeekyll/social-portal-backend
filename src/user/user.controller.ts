import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { User } from './decorators/user.decorator';
import { UserEntity } from './user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ChangePasswordDto } from './dto/changePassword.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('user/avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  async uploadAvatar(
    @User('id') currentUserId: number,
    @UploadedFiles() file,
  ): Promise<UserResponseInterface> {
    const { avatar } = file;
    const user = await this.userService.uploadAvatar(currentUserId, avatar[0]);
    return this.userService.buildUserResponse(user);
  }

  @Delete('user/avatar')
  @UseGuards(AuthGuard)
  async removeAvatar(
    @User('id') currentUserId: number | string,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.removeAvatar(currentUserId);
    return this.userService.buildUserResponse(user);
  }

  @Post('/users')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('/users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('/user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put('/user')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(
    @User('id') id: number | string,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<UserResponseInterface> {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return this.userService.buildUserResponse(updatedUser);
  }

  @Post('user/password')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async changePassword(
    @User('id') currentUserId: string | number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(
      changePasswordDto,
      currentUserId,
    );
  }

  @Get('user/articles')
  @UseGuards(AuthGuard)
  async findUserArticles(@User('id') userId: number) {
    return await this.userService.findUserArticles(userId);
  }
}
