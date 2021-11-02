import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { AuthGuard } from '../user/guards/auth.guard';
import { User } from '../user/decorators/user.decorator';
import { UserEntity } from '../user/user.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @User() author: UserEntity,
  ) {
    return await this.commentService.create(createCommentDto, author);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') commentId: number, @User() author: UserEntity) {
    return await this.commentService.delete(commentId, author);
  }

  @Get(':id')
  async findArticleComments(@Param('id') id: number) {
    return await this.commentService.findArticleComments(id);
  }
}
