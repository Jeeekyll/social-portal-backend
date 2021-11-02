import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '../article/article.entity';
import { CategoryEntity } from './category.entity';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, ArticleEntity])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
