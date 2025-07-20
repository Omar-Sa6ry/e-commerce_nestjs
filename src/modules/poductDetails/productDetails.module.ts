import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from '../product/product.module';
import { Details } from './entity/productDetails.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../users/entity/user.entity';
import { UserModule } from '../users/users.module';
import { ProductDetailsResolver } from './productDetails.resolver';
import { ProductDetailsService } from './productDetails.service';
import { Color } from '../color/entity/color.entity';
import { ProductDetailsFacade } from './fascade/productDetails.facade';
import { ProductDetailsProxy } from './proxy/productDetails.proxy';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Details, Color, Product, User]),
    RedisModule,
    ProductModule,
    UserModule,
  ],
  providers: [
    ProductDetailsResolver,
    ProductDetailsFacade,
    ProductDetailsProxy,
    ProductDetailsService,
  ],
  exports: [
    ProductDetailsService,
    ProductDetailsFacade,
    ProductDetailsProxy,
    TypeOrmModule.forFeature([Details]),
  ],
})
export class ProductDetailsModule {}
