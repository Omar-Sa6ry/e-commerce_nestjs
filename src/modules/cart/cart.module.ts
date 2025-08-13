import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.enitty';
import { Product } from '../product/entities/product.entity';
import { Details } from '../poductDetails/entity/productDetails.entity';
import { UserModule } from '../users/users.module';
import { DefaultCalculationStrategy } from './strategy/cart.strategy';
import { ProductValidatorAdapter } from './adapter/productValidator.adapter';
import { CartRepositoryProxy } from './proxy/Cart.proxy';
import { CartCommandFactory } from './factories/cartCommand.factory';
import { CartCalculationDecorator } from './decerator/cartCaluclate.decorator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, Details]),
    forwardRef(() => UserModule),
  ],
  providers: [
    CartService,
    CartRepositoryProxy,
    DefaultCalculationStrategy,
    CartCalculationDecorator,
    ProductValidatorAdapter,
    CartCommandFactory,
    CartResolver,
  ],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
