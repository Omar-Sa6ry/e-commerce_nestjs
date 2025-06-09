import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { UserModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule],
  providers: [CategoryService, CategoryResolver],
  exports: [CategoryService],
})
export class CategoryModule {}
