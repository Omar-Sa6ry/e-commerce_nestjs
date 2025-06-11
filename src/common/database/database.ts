import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';
import { Category } from 'src/modules/category/entity/category.entity';
import { Company } from 'src/modules/company/entity/company.entity';
import { Coupon } from 'src/modules/coupon/entity/coupon.entity';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';
import { Image } from 'src/modules/product/entities/image.entity';
import { Product } from 'src/modules/product/entities/product.entity';
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
          Company,
          Category,
          Product,
          Image,
          Details,
          Cart,
          CartItem,
          Coupon,
        ],
        synchronize: true,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
