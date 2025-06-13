import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { OrderService } from './services/order.service';
import { OrderResolver } from './order.resolver';
import { UserModule } from '../users/users.module';
import { PaymentService } from './services/payment.service';
import { OrderProcessingService } from './services/orderProcessing.service';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, OrderItem]), UserModule],
  providers: [
    OrderService,
    OrderResolver,
    PaymentService,
    OrderProcessingService,
  ],
})
export class OrderModule {}
