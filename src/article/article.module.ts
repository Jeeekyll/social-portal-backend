import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleEntity } from './article.entity';
import { ArticleService } from './article.service';
import { UserEntity } from '../user/user.entity';
import { FileService } from '../file/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity])],
  controllers: [ArticleController],
  providers: [ArticleService, FileService],
})
export class ArticleModule {}
