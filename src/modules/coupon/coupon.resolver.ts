import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { CouponService } from './coupon.service';
import { CreateCouponInput } from './inputs/createCoupon.input';
import { UpdateCouponInput } from './inputs/updateCoupon.input';
import { FindCouponInput } from './inputs/findCoupon.input';
import { CouponResponse, CouponsResponse } from './dto/couponResponse.dto';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decerator/auth.decerator';
import { CurrentUser } from 'src/common/decerator/currentUser.decerator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { Coupon } from './entity/coupon.entity';

@Resolver(() => Coupon)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_COUPON])
  async createCoupon(
    @CurrentUser() user: CurrentUserDto,
    @Args('createCouponInput') createCouponInput: CreateCouponInput,
  ): Promise<CouponResponse> {
    return this.couponService.create(createCouponInput);
  }

  @Query(() => CouponResponse)
  @Auth([Role.USER, Role.ADMIN], [Permission.VIEW_COUPON])
  async findCouponByName(@Args('name') name: string): Promise<CouponResponse> {
    return this.couponService.findByName(name);
  }

  @Query(() => CouponResponse)
  @Auth([Role.USER, Role.ADMIN], [Permission.VIEW_COUPON])
  async findCouponById(@Args('id') id: string): Promise<CouponResponse> {
    return this.couponService.findById(id);
  }

  @Query(() => CouponsResponse)
  @Auth([Role.ADMIN], [Permission.VIEW_COUPON])
  async findAllCoupons(
    @Args('findCouponInput', { nullable: true })
    findCouponInput?: FindCouponInput,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<CouponsResponse> {
    return this.couponService.findAll(findCouponInput, page, limit);
  }

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.COUPON_ACTIVE])
  async updateCouponActive(@Args('id') id: string): Promise<CouponResponse> {
    return this.couponService.changeIsActive(id);
  }

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_COUPON])
  async updateCoupon(
    @CurrentUser() user: CurrentUserDto,
    @Args('updateCouponInput') updateCouponInput: UpdateCouponInput,
  ): Promise<CouponResponse> {
    return this.couponService.update(updateCouponInput);
  }

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_COUPON])
  async deleteCoupon(
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<CouponResponse> {
    return this.couponService.delete(id);
  }
}
