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

@Module({
  imports: [
    TypeOrmModule.forFeature([Details, Color, Product, User]),

    ProductModule,
    UserModule,
  ],
  providers: [ProductDetailsResolver, ProductDetailsService],
  exports: [ProductDetailsService, TypeOrmModule.forFeature([Details])],
})
export class ProductDetailsModule {}
