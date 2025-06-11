import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { ConfigModule } from './common/config/config.module';
import { TranslationModule } from './common/translation/translation.module';
import { GraphqlModule } from './common/graphql/graphql.module';
import { ThrottlerModule } from './common/throttler/throttling.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { DatabaseModule } from './common/database/database';
import { CompanyModule } from './modules/company/company.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { PubSubModule } from './common/pubsup/pubSub.module';
import { ProductDetailsModule } from './modules/poductDetails/productDetails.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    DatabaseModule,
    ThrottlerModule,
    TranslationModule,
    PubSubModule,

    AuthModule,
    UserModule,
    CompanyModule,
    CategoryModule,
    ProductModule,
    ProductDetailsModule,
    CartModule,
    CouponModule,
  ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
