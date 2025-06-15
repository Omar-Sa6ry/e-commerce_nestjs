import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { CouponService } from './coupon.service';
import { CreateCouponInput } from './inputs/createCoupon.input';
import { UpdateCouponInput } from './inputs/updateCoupon.input';
import { FindCouponInput } from './inputs/findCoupon.input';
import { CouponResponse, CouponsResponse } from './dto/couponResponse.dto';
import { Permission, Role } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decerator/auth.decerator';
import { Coupon } from './entity/coupon.entity';
import { CouponIdInput, CouponNameInput } from './inputs/coupon.input';

@Resolver(() => Coupon)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.CREATE_COUPON])
  async createCoupon(
    @Args('createCouponInput') createCouponInput: CreateCouponInput,
  ): Promise<CouponResponse> {
    return this.couponService.create(createCouponInput);
  }

  @Query(() => CouponResponse)
  @Auth([Role.USER, Role.ADMIN], [Permission.VIEW_COUPON])
  async findCouponByName(
    @Args('name') name: CouponNameInput,
  ): Promise<CouponResponse> {
    return this.couponService.findByName(name.name);
  }

  @Query(() => CouponResponse)
  @Auth([Role.USER, Role.ADMIN], [Permission.VIEW_COUPON])
  async findCouponById(@Args('id') id: CouponIdInput): Promise<CouponResponse> {
    return this.couponService.findById(id.couponId);
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
  async updateCouponActive(
    @Args('id') id: CouponIdInput,
  ): Promise<CouponResponse> {
    return this.couponService.changeIsActive(id.couponId);
  }

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.UPDATE_COUPON])
  async updateCoupon(
    @Args('updateCouponInput') updateCouponInput: UpdateCouponInput,
  ): Promise<CouponResponse> {
    return this.couponService.update(updateCouponInput);
  }

  @Mutation(() => CouponResponse)
  @Auth([Role.ADMIN], [Permission.DELETE_COUPON])
  async deleteCoupon(@Args('id') id: CouponIdInput): Promise<CouponResponse> {
    return this.couponService.delete(id.couponId);
  }
}
