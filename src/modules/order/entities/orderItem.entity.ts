import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';

@ObjectType()
@Entity()
export class OrderItem extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  @Index()
  orderId: string;

  @Field(() => String)
  @Column({ length: 26 })
  @Index()
  detailsId: string;

  @Field(() => Int)
  @Column()
  quantity: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Field(() => Details)
  @ManyToOne(() => Details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'detailsId' })
  productDetails: Details;
}
