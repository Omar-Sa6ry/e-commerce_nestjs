import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { QueryRunner, Repository } from 'typeorm';
import { Coupon } from '../../coupon/entity/coupon.entity';
import { User } from '../../users/entity/user.entity';
import { UserAddress } from '../../userAdress/entity/userAddress.entity';
import { Details } from '../../poductDetails/entity/productDetails.entity';
import { TypeCoupon } from '../../../common/constant/enum.constant';
import { CartItem } from '../../cart/entities/cartItem.enitty';
import { OrderItem } from '../entities/orderItem.entity';
import { Product } from '../../product/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/modules/cart/entities/cart.entity';

@Injectable()
export class OrderProcessingService {
  constructor(
    private readonly i18n: I18nService,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async validateCoupon(
    queryRunner: QueryRunner,
    couponId?: string,
  ): Promise<Coupon | null> {
    if (!couponId) return null;

    const coupon = await queryRunner.manager.findOne(Coupon, {
      where: { id: couponId, isActive: true },
    });

    if (!coupon || coupon.expiryDate < new Date() || !coupon.isActive)
      throw new BadRequestException(await this.i18n.t('coupon.INVALID_COUPON'));

    return coupon;
  }

  async validateUser(
    queryRunner: QueryRunner,
    userId: string,
    withCart = false,
  ): Promise<User> {
    const user = await queryRunner.manager.findOne(User, {
      where: { id: userId },
      relations: ['cart', 'cart.cartItems', 'cart.cartItems.product'],
    });

    if (!user) throw new NotFoundException(await this.i18n.t('user.NotFound'));

    if (withCart) {
      user.cart = await queryRunner.manager.findOneOrFail(Cart, {
        where: { user: { id: userId } },
        relations: ['cartItems', 'cartItems.product', 'cartItems.details'],
      });
    }

    return user;
  }

  async validateAddress(
    queryRunner: QueryRunner,
    userId: string,
    addressId: string,
  ): Promise<UserAddress> {
    const address = await queryRunner.manager.findOne(UserAddress, {
      where: { id: addressId, user: { id: userId } },
    });

    if (!address)
      throw new NotFoundException(await this.i18n.t('address.NOT_FOUND'));

    return address;
  }

  async validateProductDetails(
    queryRunner: QueryRunner,
    detailsId: string,
  ): Promise<Details> {
    const details = await queryRunner.manager.findOne(Details, {
      where: { id: detailsId },
      relations: ['product'],
    });

    if (!details || details.quantity === 0)
      throw new BadRequestException(
        await this.i18n.t('productDetails.NOT_ENOUGH_STOCK'),
      );

    return details;
  }

  async validateCart(user: User): Promise<void> {
    if (!user.cart || user.cart.cartItems.length === 0)
      throw new BadRequestException(await this.i18n.t('cart.CART_EMPTY'));
  }

  async processCartItems(
    queryRunner: QueryRunner,
    cartItems: CartItem[],
    orderId: string,
    delevaryPrice: number,
  ): Promise<number> {
    let totalPrice = delevaryPrice;

    for (const cartItem of cartItems) {
      const productDetails = await queryRunner.manager.findOne(Details, {
        where: { id: cartItem.details.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!productDetails || productDetails.quantity < cartItem.quantity) {
        throw new BadRequestException(
          await this.i18n.t('productDetails.NOT_ENOUGH_STOCK'),
        );
      }

      const itemPrice = cartItem.product.price * cartItem.quantity;
      totalPrice += itemPrice;

      productDetails.quantity -= cartItem.quantity;
      await queryRunner.manager.save(productDetails);

      const orderItem = await queryRunner.manager.create(OrderItem, {
        orderId,
        detailsId: cartItem.details.id,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
      });
      await queryRunner.manager.save(orderItem);
    }

    return totalPrice;
  }

  async processSingleProduct(
    queryRunner: QueryRunner,
    orderId: string,
    detailsId: string,
    quantity: number,
    delevaryPrice: number,
  ): Promise<number> {
    const productDetails = await queryRunner.manager.findOne(Details, {
      where: { id: detailsId },
      relations: ['product'],
    });

    if (!productDetails)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND'),
      );

    if (productDetails.quantity < quantity)
      throw new BadRequestException(
        await this.i18n.t('productDetails.NOT_ENOUGH_STOCK'),
      );

    const totalPrice = productDetails.product.price * quantity;

    productDetails.quantity -= quantity;
    await queryRunner.manager.save(productDetails);

    const orderItem = await queryRunner.manager.create(OrderItem, {
      orderId,
      detailsId,
      quantity,
      price: productDetails.product.price,
    });
    await queryRunner.manager.save(orderItem);

    return totalPrice + delevaryPrice;
  }

  applyCouponDiscount(coupon: Coupon, totalPrice: number): number {
    if (!coupon) return totalPrice;

    if (coupon.type === TypeCoupon.PERCENTAGE) {
      return totalPrice - totalPrice * (coupon.discount / 100);
    } else {
      return totalPrice - coupon.discount;
    }
  }

  async clearUserCart(queryRunner: QueryRunner, user: User): Promise<void> {
    await queryRunner.manager.remove(CartItem, user.cart.cartItems);
    user.cart.totalPrice = 0;
    await queryRunner.manager.save(user.cart);
  }


}
