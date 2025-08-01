import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {  QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Cart } from './entities/cart.entity';
import { CartItemResponse, CartItemsResponse } from './dtos/cartItem.dto';
import { CartItemInput } from './inputs/cartItem.input';
import { TotalCartsResponse } from './dtos/totalCarts.dto';
import { CartRepositoryProxy } from './proxy/Cart.proxy';
import { CartItem } from './entities/cartItem.enitty';
import { Product } from '../product/entities/product.entity';
import { DefaultCalculationStrategy } from './strategy/cart.strategy';
import { ICartObserver } from './interfaces/ICartObserver.interface';
import { CartCommandFactory } from './factories/cartCommand.factory';
import { Transactional } from 'src/common/decerator/transactional.decerator';
import { Details } from '../poductDetails/entity/productDetails.entity';
import { CartResponse } from './dtos/cartResponse';
import { CartFactory } from './factories/cart.factory';
import { CartItemFactory } from './factories/cartItem.factory';
import {
  CartExistsValidator,
  CartOwnershipValidator,
  CartValidatorComposite,
} from './composite/cart.composite';

@Injectable()
export class CartService {
  private readonly MAX_QUANTITY = 100;
  private observers: ICartObserver[] = [];

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Details)
    private readonly detailsRepository: Repository<Details>,
    private readonly i18n: I18nService,
    private readonly cartRepositoryProxy: CartRepositoryProxy,
    private readonly calculationStrategy: DefaultCalculationStrategy,
    @Inject(forwardRef(() => CartCommandFactory))
    private readonly commandFactory: CartCommandFactory,
  ) {}

  async addToCart(
    userId: string,
    cartItemInput: CartItemInput,
  ): Promise<CartResponse> {
    const command = this.commandFactory.createAddToCartCommand(
      userId,
      cartItemInput,
    );
    const result = await command.execute();
    this.notifyObservers(result.data);
    return result;
  }

  @Transactional()
  async updateQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItemResponse> {
    this.validateQuantity(quantity);

    const userCart = await this.cartRepositoryProxy.findOneWithItems({
      userId,
    });

    const validator = new CartValidatorComposite();
    validator.add(new CartExistsValidator(this.i18n));
    validator.add(new CartOwnershipValidator(this.i18n, userId));
    await validator.validate(userCart);

    const cartItem = userCart.cartItems.find((item) => item.id === cartItemId);
    if (!cartItem) {
      throw new NotFoundException(
        await this.i18n.t('cart.ITEM_NOT_FOUND', {
          args: { id: cartItemId },
        }),
      );
    }

    const productDetail = await this.detailsRepository.findOne({
      where: { id: cartItem.detailsId },
    });

    if (!productDetail || productDetail.quantity < quantity) {
      throw new BadRequestException(await this.i18n.t('cart.NOT_ENOUGH_STOCK'));
    }

    const product = await this.productRepository.findOne({
      where: { id: cartItem.productId },
    });

    if (!product) {
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', {
          args: { id: cartItem.productId },
        }),
      );
    }

    const productPrice =
      typeof product.price === 'string'
        ? parseFloat(product.price)
        : product.price;

    const oldItemTotal =
      typeof cartItem.totalPrice === 'string'
        ? parseFloat(cartItem.totalPrice)
        : cartItem.totalPrice;

    const newItemTotal = this.calculationStrategy.calculateItemTotal(
      productPrice,
      quantity,
    );

    cartItem.quantity = quantity;
    cartItem.totalPrice = newItemTotal;
    await this.cartItemRepository.save(cartItem);

    userCart.totalPrice = await this.calculationStrategy.calculate(userCart);
    await this.cartRepository.save(userCart);

    await this.notifyObservers(userCart);

    return {
      data: cartItem,
      statusCode: 200,
      message: await this.i18n.t('cart.QUANTITY_UPDATED'),
    };
  }

  @Transactional()
  async deleteCartItems(userId: string): Promise<CartResponse> {
    const userCart = await this.cartRepositoryProxy.findOneWithItems({
      userId,
    });

    const validator = new CartValidatorComposite();
    validator.add(new CartExistsValidator(this.i18n));
    validator.add(new CartOwnershipValidator(this.i18n, userId));
    await validator.validate(userCart);

    await this.cartItemRepository.remove(userCart.cartItems);
    userCart.totalPrice = 0;
    await this.cartRepository.save(userCart);
    await this.notifyObservers(userCart);

    return {
      data: userCart,
      message: await this.i18n.t('cart.EMPTY'),
    };
  }

  @Transactional()
  async checkTotalCart(userId: string): Promise<TotalCartsResponse> {
    const carts = await this.cartRepository.find({
      where: { userId },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (carts.length === 0) {
      throw new NotFoundException(
        await this.i18n.t('cart.NOT_FOUND', {
          args: { id: userId },
        }),
      );
    }

    const totals = await Promise.all(
      carts.map((cart) => this.calculationStrategy.calculate(cart)),
    );

    const grandTotal = totals.reduce((acc, curr) => acc + curr, 0);

    return {
      data: parseFloat(grandTotal.toFixed(2)),
      message: await this.i18n.t('cart.TOTAL_CALCULATED'),
    };
  }

  async findItems(cartId: string, userId: string): Promise<CartItemsResponse> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!cart || cart.userId !== userId)
      throw new NotFoundException(
        await this.i18n.t('cart.NOT_FOUND', {
          args: { id: cartId },
        }),
      );

    const items = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['product', 'details'],
    });
    return { items: items || [] };
  }

  @Transactional()
  async deleteCart(userId: string, cartId: string): Promise<CartResponse> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, userId },
      relations: ['cartItems'],
    });

    const validator = new CartValidatorComposite();
    validator.add(new CartExistsValidator(this.i18n));
    validator.add(new CartOwnershipValidator(this.i18n, userId));
    await validator.validate(cart);

    await this.cartItemRepository.remove(cart.cartItems);
    await this.cartRepository.remove(cart);
    return {
      data: null,
      message: await this.i18n.t('cart.DELETED_CART', {
        args: { id: cartId },
      }),
    };
  }

  // ========== PRIVATE HELPER METHODS ==========

  async validateQuantity(quantity: number): Promise<void> {
    if (quantity <= 0)
      throw new BadRequestException(await this.i18n.t('cart.INVALID_QUANTITY'));

    if (quantity > this.MAX_QUANTITY)
      throw new BadRequestException(
        await this.i18n.t('cart.MAX_QUANTITY_EXCEEDED', {
          args: { max: this.MAX_QUANTITY },
        }),
      );
  }

  private async getFullCart(userId: string): Promise<Cart> {
    return this.cartRepositoryProxy.findOneFullCart({ userId });
  }

  private async getUserCartWithItems(userId: string): Promise<Cart> {
    const cart = await this.cartRepositoryProxy.findOneWithItems({ userId });

    const validator = new CartValidatorComposite();
    validator.add(new CartExistsValidator(this.i18n));
    await validator.validate(cart);

    return cart;
  }

  async getUserCartWithItemsForUser(userId: string): Promise<Cart | []> {
    const cart = await this.cartRepositoryProxy.findOneWithItems({ userId });
    return cart || [];
  }

  private async getOrCreateUserCart(
    queryRunner: QueryRunner,
    userId: string,
  ): Promise<Cart> {
    let cart = await queryRunner.manager.findOne(Cart, {
      where: { userId },
      relations: ['cartItems'],
    });

    if (!cart) {
      cart = CartFactory.create(userId);
      await queryRunner.manager.save(cart);
    }

    return cart;
  }

  private async updateExistingCartItem(
    queryRunner: QueryRunner,
    existingItem: CartItem,
    quantityToAdd: number,
    price: number,
    availableQuantity: number,
  ): Promise<void> {
    const newQuantity = existingItem.quantity + quantityToAdd;

    if (availableQuantity < newQuantity)
      throw new BadRequestException(await this.i18n.t('cart.NOT_ENOUGH_STOCK'));

    existingItem.quantity = newQuantity;
    existingItem.totalPrice = newQuantity * price;
    await queryRunner.manager.save(existingItem);
  }

  private async addNewCartItem(
    queryRunner: QueryRunner,
    cart: Cart,
    cartItemInput: CartItemInput,
    price: number,
  ): Promise<void> {
    const newCartItem = CartItemFactory.create(cart.id, cartItemInput, price);
    await queryRunner.manager.save(newCartItem);

    if (!cart.cartItems) cart.cartItems = [];
    cart.cartItems.push(newCartItem);
  }

  // ========== RESOLVER FIELD ==========

  async getCartItemsByCartId(cartId: string): Promise<CartItem[]> {
    const cartItems = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['product', 'details'],
    });

    return cartItems;
  }

  // =============Observer=================
  addObserver(observer: ICartObserver): void {
    this.observers.push(observer);
  }

  private async notifyObservers(cart: Cart): Promise<void> {
    await Promise.all(
      this.observers.map((observer) => observer.onCartUpdated(cart)),
    );
  }
}
