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
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CouponService } from 'src/modules/coupon/coupon.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../entities/orderItem.entity';
import { OrderItemFactory } from '../factory.ts/order.factory';

@Injectable()
export class OrderProcessingService {
  constructor(
    private readonly i18n: I18nService,
    private readonly couponService: CouponService,
    @InjectRepository(Details) private detailsRepository: Repository<Details>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
  ) {}

  async validateCoupon(couponId?: string): Promise<Coupon | null> {
    if (!couponId) return null;

    const coupon = await (
      await this.couponService.findByIdAndActive(couponId)!
    )?.data;
    if (!coupon || coupon.expiryDate < new Date() || !coupon.isActive)
      throw new BadRequestException(await this.i18n.t('coupon.INVALID_COUPON'));

    return coupon;
  }

  async validateUser(userId: string, withCart = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: withCart
        ? ['cart', 'cart.cartItems', 'cart.cartItems.product']
        : [],
    });

    if (!user) throw new NotFoundException(await this.i18n.t('user.NotFound'));

    if (withCart && !user.cart) {
      user.cart = await this.cartRepository.findOne({
        where: { user: { id: userId } },
        relations: ['cartItems', 'cartItems.product', 'cartItems.details'],
      });
    }

    return user;
  }

  async validateAddress(
    userId: string,
    addressId: string,
  ): Promise<UserAddress> {
    const address = await this.userAddressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address)
      throw new NotFoundException(await this.i18n.t('address.NOT_FOUND'));

    return address;
  }

  async validateProductDetails(detailsId: string): Promise<Details> {
    const details = await this.detailsRepository.findOne({
      where: { id: detailsId },
      relations: ['product'],
      lock: { mode: 'pessimistic_write' },
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
    cartItems: CartItem[],
    orderId: string,
    delevaryPrice: number,
  ): Promise<number> {
    let totalPrice = delevaryPrice;

    for (const cartItem of cartItems) {
      const productDetails = await this.detailsRepository.findOne({
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
      await this.detailsRepository.save(productDetails);

      const orderItem = OrderItemFactory.create(
        orderId,
        cartItem.details.id,
        cartItem.quantity,
        cartItem.product.price,
      );
      await this.orderItemRepository.save(orderItem);
    }

    return totalPrice;
  }

  async processSingleProduct(
    orderId: string,
    detailsId: string,
    quantity: number,
    delevaryPrice: number,
  ): Promise<number> {
    const productDetails = await this.detailsRepository.findOne({
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
    await this.detailsRepository.save(productDetails);

    const orderItem = OrderItemFactory.create(
      orderId,
      detailsId,
      quantity,
      productDetails.product.price,
    );
    await this.orderItemRepository.save(orderItem);

    return totalPrice + delevaryPrice;
  }

  applyCouponDiscount(coupon: Coupon, totalPrice: number): number {
    if (!coupon) return totalPrice;

    return coupon.type === TypeCoupon.PERCENTAGE
      ? totalPrice - totalPrice * (coupon.discount / 100)
      : totalPrice - coupon.discount;
  }

  async clearUserCart(user: User): Promise<void> {
    await this.cartItemRepository.remove(user.cart.cartItems);
    user.cart.totalPrice = 0;
    await this.cartRepository.save(user.cart);
  }
}
