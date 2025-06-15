import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Cart } from './entities/cart.entity';
import { CartItemResponse, CartItemsResponse } from './dtos/cartItem.dto';
import { CartItemInput } from './inputs/cartItem.input';
import { TotalCartsResponse } from './dtos/totalCarts.dto';
import { CartItem } from './entities/cartItem.enitty';
import { Product } from '../product/entities/product.entity';
import { Details } from '../poductDetails/entity/productDetails.entity';
import { CartResponse } from './dtos/cartResponse';

@Injectable()
export class CartService {
  private readonly MAX_QUANTITY = 100;

  constructor(
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Details)
    private readonly detailsRepository: Repository<Details>,
  ) {}

  // ========== PUBLIC METHODS ==========

  async addToCart(
    userId: string,
    cartItemInput: CartItemInput,
  ): Promise<CartResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, detailsId, quantity } = cartItemInput;
      this.validateQuantity(quantity);

      const { product, detail } = await this.validateProductAndDetails(
        productId,
        detailsId,
      );

      if (detail.quantity < quantity) {
        throw new BadRequestException(
          await this.i18n.t('cart.NOT_ENOUGH_STOCK'),
        );
      }

      let userCart = await this.getOrCreateUserCart(queryRunner, userId);

      const existingItem = userCart.cartItems?.find(
        (item) => item.productId === productId && item.detailsId === detailsId,
      );

      if (existingItem) {
        await this.updateExistingCartItem(
          queryRunner,
          existingItem,
          quantity,
          product.price,
          detail.quantity,
        );
      } else {
        await this.addNewCartItem(
          queryRunner,
          userCart,
          cartItemInput,
          product.price,
        );
      }

      await this.recalculateCartTotal(queryRunner, userCart);
      await queryRunner.commitTransaction();

      userCart = await this.getFullCart(userId);
      return {
        data: userCart,
        statusCode: existingItem ? 200 : 201,
        message: await this.i18n.t(
          existingItem ? 'cart.UPDATED' : 'cart.ITEM_ADDED',
        ),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItemResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.validateQuantity(quantity);

      const userCart = await this.getUserCartWithItems(userId);
      const cartItem = userCart.cartItems.find(
        (item) => item.id === cartItemId,
      );

      if (!cartItem)
        throw new NotFoundException(
          await this.i18n.t('cart.ITEM_NOT_FOUND', {
            args: { id: cartItemId },
          }),
        );

      const productDetail = await this.detailsRepository.findOne({
        where: { id: cartItem.detailsId },
      });

      if (!productDetail || productDetail.quantity < quantity)
        throw new BadRequestException(
          await this.i18n.t('cart.NOT_ENOUGH_STOCK'),
        );

      const product = await this.productRepository.findOne({
        where: { id: cartItem.productId },
      });

      const productPrice = parseFloat(product.price as any);
      const oldItemTotal = parseFloat(cartItem.totalPrice as any);
      const cartTotal = parseFloat(userCart.totalPrice as any);

      const newItemTotal = parseFloat((quantity * productPrice).toFixed(2));
      const priceDifference = parseFloat(
        (newItemTotal - oldItemTotal).toFixed(2),
      );

      cartItem.quantity = quantity;
      cartItem.totalPrice = newItemTotal;

      await queryRunner.manager.save(cartItem);

      userCart.totalPrice = parseFloat(
        (cartTotal + priceDifference).toFixed(2),
      );
      await queryRunner.manager.save(userCart);

      await queryRunner.commitTransaction();

      return {
        data: cartItem,
        statusCode: 200,
        message: await this.i18n.t('cart.QUANTITY_UPDATED'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCartItems(userId: string): Promise<CartResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userCart = await this.getUserCartWithItems(userId);
      await queryRunner.manager.remove(CartItem, userCart.cartItems);
      userCart.totalPrice = 0;
      await queryRunner.manager.save(userCart);
      await queryRunner.commitTransaction();

      return {
        data: userCart,
        message: await this.i18n.t('cart.EMPTY'),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkTotalCart(userId: string): Promise<TotalCartsResponse> {
    const carts = await this.cartRepository.find({
      where: { userId },
      relations: ['cartItems'],
    });

    if (carts.length === 0) {
      throw new NotFoundException(
        await this.i18n.t('cart.NOT_FOUND', { args: { id: userId } }),
      );
    }

    const total = carts.reduce((acc, cart) => {
      const price =
        typeof cart.totalPrice === 'string'
          ? parseFloat(cart.totalPrice)
          : cart.totalPrice;
      return acc + price;
    }, 0);

    return { data: parseFloat(total.toFixed(2)) };
  }

  async findItems(cartId: string, userId: string): Promise<CartItemsResponse> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!cart || cart.userId !== userId)
      throw new NotFoundException(
        await this.i18n.t('cart.NOT_FOUND', { args: { id: cartId } }),
      );

    const items = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['product', 'details'],
    });
    return { items: items || [] };
  }

  async deleteCart(userId: string, cartId: string): Promise<CartResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartRepository.findOne({
        where: { id: cartId, userId },
        relations: ['cartItems'],
      });

      if (!cart)
        throw new NotFoundException(await this.i18n.t('cart.NOT_FOUND'));

      await queryRunner.manager.remove(CartItem, cart.cartItems);
      await queryRunner.manager.remove(Cart, cart);
      await queryRunner.commitTransaction();

      return {
        data: null,
        message: await this.i18n.t('cart.DELETED_CART', {
          args: { id: cartId },
        }),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  private async validateQuantity(quantity: number): Promise<void> {
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
    return this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems', 'cartItems.product', 'cartItems.details'],
    });
  }

  private async getUserCartWithItems(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems'],
    });

    if (!cart) throw new NotFoundException(await this.i18n.t('cart.NOT_FOUND'));

    return cart;
  }

  async getUserCartWithItemsForUser(userId: string): Promise<Cart | []> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['cartItems'],
    });

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
      cart = queryRunner.manager.create(Cart, {
        userId,
        totalPrice: 0,
      });
      await queryRunner.manager.save(cart);
    }

    return cart;
  }

  private async validateProductAndDetails(
    productId: string,
    detailsId: string,
  ): Promise<{ product: Product; detail: Details }> {
    const [product, detail] = await Promise.all([
      this.productRepository.findOne({ where: { id: productId } }),
      this.detailsRepository.findOne({
        where: { id: detailsId },
        relations: ['product'],
      }),
    ]);

    if (!product)
      throw new NotFoundException(
        await this.i18n.t('product.NOT_FOUND', { args: { id: productId } }),
      );

    if (!detail)
      throw new NotFoundException(
        await this.i18n.t('productDetails.NOT_FOUND', {
          args: { id: detailsId },
        }),
      );

    if (detail.product.id !== productId)
      throw new BadRequestException(
        await this.i18n.t('productDetails.NOT_MATCHED', {
          args: { id: detail.product.id },
        }),
      );

    return { product, detail };
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
    const newCartItem = queryRunner.manager.create(CartItem, {
      ...cartItemInput,
      totalPrice: price * cartItemInput.quantity,
      cartId: cart.id,
    });
    await queryRunner.manager.save(newCartItem);

    if (!cart.cartItems) cart.cartItems = [];

    cart.cartItems.push(newCartItem);
  }

  private async recalculateCartTotal(
    queryRunner: QueryRunner,
    cart: Cart,
  ): Promise<void> {
    const items = await queryRunner.manager.find(CartItem, {
      where: { cartId: cart.id },
    });

    cart.totalPrice = items.reduce(
      (acc, cart) => acc + parseFloat(cart.totalPrice.toString()),
      0,
    );
    await queryRunner.manager.save(cart);
  }

  // ========== RESOLVER FIELD ==========

  async getCartItemsByCartId(cartId: string): Promise<CartItem[]> {
    const cartItems = await this.cartItemRepository.find({
      where: { cartId },
      relations: ['product', 'details'],
    });

    return cartItems;
  }
}
