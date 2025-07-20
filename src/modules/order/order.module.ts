import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { OrderService } from './services/order.service';
import { OrderResolver } from './order.resolver';
import { UserModule } from '../users/users.module';
import { StripeService } from '../stripe/stripe.service';
import { Product } from '../product/entities/product.entity';
import { OrderProcessingService } from './services/orderProcessing.service';
import { BullModule } from '@nestjs/bullmq';
import { QueuesNames } from 'src/common/constant/enum.constant';
import { NotificationModule } from 'src/common/queues/notification/notification.module';
import { EmailModule } from 'src/common/queues/email/email.module';
import { OrderProcessor } from './queue/order.processor';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { NotificationService } from 'src/common/queues/notification/notification.service';
import { RedisModule } from 'src/common/redis/redis.module';
import { OrderFacadeService } from './fascade/order.fascade';
import { CouponModule } from '../coupon/coupon.module';
import { Details } from '../poductDetails/entity/productDetails.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cartItem.enitty';
import { UserAddress } from '../userAdress/entity/userAddress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Details,
      Cart,
      CartItem,
      Product,
      OrderItem,
      UserAddress,
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({ name: QueuesNames.ORDER_PROCESSING }),
    EmailModule,
    RedisModule,
    NotificationModule,
    UserModule,
    CouponModule,
  ],
  providers: [
    OrderService,
    OrderResolver,
    StripeService,
    OrderProcessingService,
    OrderFacadeService,
    OrderProcessor,
    SendEmailService,
    NotificationService,
  ],
  exports: [
    OrderProcessingService,
    OrderService,
    OrderFacadeService,
    OrderProcessor,
    TypeOrmModule,
    BullModule,
    RedisModule,
  ],
})
export class OrderModule {}
