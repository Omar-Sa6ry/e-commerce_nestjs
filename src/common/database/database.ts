import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from 'src/modules/address/entity/address.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';
import { Category } from 'src/modules/category/entity/category.entity';
import { Color } from 'src/modules/color/entity/color.entity';
import { Company } from 'src/modules/company/entity/company.entity';
import { Coupon } from 'src/modules/coupon/entity/coupon.entity';
import { City } from 'src/modules/location/entities/city.entity';
import { Country } from 'src/modules/location/entities/country.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/orderItem.entity';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';
import { Image } from 'src/modules/product/entities/image.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { UserAddress } from 'src/modules/userAdress/entity/userAddress.entity';
import { User } from 'src/modules/users/entity/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          City,
          Country,
          Address,
          UserAddress,
          Company,
          Category,
          Product,
          Color,
          Image,
          Details,
          Cart,
          CartItem,
          Coupon,
          Order,
          OrderItem,
        ],
        synchronize: true,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
