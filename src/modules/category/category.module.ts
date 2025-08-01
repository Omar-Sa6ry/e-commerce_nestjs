import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { CreateCategoryOperation } from './template/category.template';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { UserModule } from '../users/users.module';
import {
  CreateCategoryStrategy,
  UpdateCategoryStrategy,
} from './strategy/category.stategy';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule],
  providers: [
    CategoryService,
    CreateCategoryOperation,
    CreateCategoryStrategy,
    UpdateCategoryStrategy,
    CategoryResolver,
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
