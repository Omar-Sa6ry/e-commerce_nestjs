import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { RedisModule } from 'src/common/redis/redis.module';
import { ProductDetailsLoader } from '../poductDetails/loader/productDetails.loader';
import { UserModule } from '../users/users.module';
import { Category } from '../category/entity/category.entity';
import { Company } from '../company/entity/company.entity';
import { PubSubModule } from '../../common/pubsup/pubSub.module';
import { UploadModule } from 'src/common/upload/upload.module';
import { Image } from './entities/image.entity';
import { Details } from '../poductDetails/entity/productDetails.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Image, Company, Details]),
    RedisModule,
    UserModule,
    PubSubModule,
    UploadModule,
  ],
  providers: [ProductService, ProductResolver, ProductDetailsLoader],
  exports: [ProductService],
})
export class ProductModule {}
