import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { ColorService } from './color.service';
import { Auth } from 'src/common/decorator/auth.decorator';
import { Color } from './entity/color.entity';
import { ColorResponse, ColorsResponse } from './dto/colorResponse.dto';
import { CreateColorInput } from './inputs/createColor.input';
import { UpdateColorInput } from './inputs/updateColor.input';
import { Role, Permission } from 'src/common/constant/enum.constant';
import { Int } from '@nestjs/graphql';
import { ColorIdInput, ColorNameInput } from './inputs/color.input';

@Resolver(() => Color)
export class ColorResolver {
  constructor(private readonly colorService: ColorService) {}

  @Mutation(() => ColorResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_COLOR])
  createColor(
    @Args('createColorInput') createColorInput: CreateColorInput,
  ): Promise<ColorResponse> {
    return this.colorService.create(createColorInput);
  }

  @Query(() => ColorsResponse)
  @Auth([Role.ADMIN, Role.USER], [Permission.VIEW_COLOR])
  getAllColors(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ColorsResponse> {
    return this.colorService.findAll(page, limit);
  }

  @Query(() => ColorResponse)
  @Auth([Role.ADMIN, Role.USER], [Permission.VIEW_COLOR])
  getColorById(@Args('id') id: ColorIdInput): Promise<ColorResponse> {
    return this.colorService.findById(id.colorId);
  }

  @Query(() => ColorResponse)
  @Auth([Role.ADMIN, Role.USER], [Permission.VIEW_COLOR])
  getColorByName(@Args('name') name: ColorNameInput): Promise<ColorResponse> {
    return this.colorService.findByName(name.name);
  }

  @Mutation(() => ColorResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_COLOR])
  updateColor(
    @Args('updateColorInput') updateColorInput: UpdateColorInput,
  ): Promise<ColorResponse> {
    return this.colorService.update(updateColorInput);
  }

  @Mutation(() => ColorResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_COLOR])
  deleteColor(@Args('id') id: ColorIdInput): Promise<ColorResponse> {
    return this.colorService.remove(id.colorId);
  }
}
