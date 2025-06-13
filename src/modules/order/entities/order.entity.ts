import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { OrderItem } from './orderItem.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from 'src/common/constant/enum.constant';
import { User } from 'src/modules/users/entity/user.entity';
import { Address } from 'src/modules/address/entity/address.entity';
import { Coupon } from 'src/modules/coupon/entity/coupon.entity';
import { ObjectType, Field, Float } from '@nestjs/graphql';
import { UserAddress } from 'src/modules/userAdress/entity/userAddress.entity';

@ObjectType()
@Entity()
export class Order extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  userId: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPriceAfterDiscount: number;

  @Field(() => String)
  @Column({ length: 26 })
  addressId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, length: 26 })
  couponId?: string;

  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Field(() => PaymentMethod)
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethod;

  @Field(() => PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => UserAddress)
  @ManyToOne(() => UserAddress, (address) => address.orders, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'addressId' })
  address: UserAddress;

  @Field(() => Coupon, { nullable: true })
  @ManyToOne(() => Coupon, (coupon) => coupon.orders, { nullable: true })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @Field(() => [OrderItem], { nullable: true })
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    nullable: true,
  })
  orderItems?: OrderItem[];

  @BeforeInsert()
  updateDiscount() {
    if (!this.totalPriceAfterDiscount)
      this.totalPriceAfterDiscount = this.totalPrice;
  }
}
