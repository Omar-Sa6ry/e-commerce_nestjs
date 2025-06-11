import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.enitty';
import { Product } from '../product/entities/product.entity';
import { Details } from '../poductDetails/entity/productDetails.entity';
import { UserModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product, Details]),
    UserModule,
  ],
  providers: [CartService, CartResolver],
})
export class CartModule {}
