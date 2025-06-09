import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entity/category.entity';
import { Auth } from 'src/common/decerator/auth.decerator';
import { Role } from 'src/common/constant/enum.constant';
import { Permission } from 'src/common/constant/enum.constant';
import {
  CategoryResponse,
  CategoriesResponse,
} from './dto/categoryResponse.dto';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth([Role.ADMIN], [Permission.CREATE_CATEGORY])
  @Mutation(() => CategoryResponse)
  async createCategory(@Args('name') name: string): Promise<CategoryResponse> {
    return this.categoryService.create(name);
  }

  @Query(() => CategoriesResponse)
  async getAllCategories(
    @Args('page', { nullable: true }) page?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<CategoriesResponse> {
    return this.categoryService.findAll(page, limit);
  }

  @Query(() => CategoryResponse)
  async getCategoryById(@Args('id') id: string): Promise<CategoryResponse> {
    return this.categoryService.findById(id);
  }

  @Query(() => CategoryResponse)
  async getCategoryByName(
    @Args('name') name: string,
  ): Promise<CategoryResponse> {
    return this.categoryService.findByName(name);
  }

  @Auth([Role.ADMIN], [Permission.UPDATE_CATEGORY])
  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Args('id') id: string,
    @Args('name') name: string,
  ): Promise<CategoryResponse> {
    return this.categoryService.update(id, name);
  }

  @Auth([Role.ADMIN], [Permission.DELETE_CATEGORY])
  @Mutation(() => CategoryResponse)
  async deleteCategory(@Args('id') id: string): Promise<CategoryResponse> {
    return this.categoryService.remove(id);
  }
}
