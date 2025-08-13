import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entity/category.entity';
import { Auth } from 'src/common/decorator/auth.decorator';
import { Role } from 'src/common/constant/enum.constant';
import { Permission } from 'src/common/constant/enum.constant';
import {
  CategoryResponse,
  CategoriesResponse,
} from './dto/categoryResponse.dto';
import { CreateCategoryInput } from './inputs/createCategoryr.input';
import { CategoryIdInput, CategoryNameInput } from './inputs/category.input';
import { UpdateCategoryInput } from './inputs/updateColor.input';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth([Role.ADMIN], [Permission.CREATE_CATEGORY])
  @Mutation(() => CategoryResponse)
  async createCategory(
    @Args('name') name: CreateCategoryInput,
  ): Promise<CategoryResponse> {
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
  async getCategoryById(
    @Args('id') id: CategoryIdInput,
  ): Promise<CategoryResponse> {
    return this.categoryService.findById(id.categoryId);
  }

  @Query(() => CategoryResponse)
  async getCategoryByName(
    @Args('name') name: CategoryNameInput,
  ): Promise<CategoryResponse> {
    return this.categoryService.findByName(name.name);
  }

  @Auth([Role.ADMIN], [Permission.UPDATE_CATEGORY])
  @Mutation(() => CategoryResponse)
  async updateCategory(
    @Args('id') id: CategoryIdInput,
    @Args('name') name: UpdateCategoryInput,
  ): Promise<CategoryResponse> {
    return this.categoryService.update(id.categoryId, name);
  }

  @Auth([Role.ADMIN], [Permission.DELETE_CATEGORY])
  @Mutation(() => CategoryResponse)
  async deleteCategory(
    @Args('id') id: CategoryIdInput,
  ): Promise<CategoryResponse> {
    return this.categoryService.remove(id.categoryId);
  }
}
