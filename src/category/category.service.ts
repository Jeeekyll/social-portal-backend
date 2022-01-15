import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryResponseInterface } from './types/categoryResponse.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(): Promise<CategoryResponseInterface> {
    const categories = await this.categoryRepository.find();
    return { data: categories };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    return await this.categoryRepository.save(createCategoryDto);
  }
}
