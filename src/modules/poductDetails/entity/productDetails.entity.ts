import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Size } from 'src/common/constant/enum.constant';
import { Product } from 'src/modules/product/entities/product.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';
import { OrderItem } from 'src/modules/order/entities/orderItem.entity';
import { Color } from 'src/modules/color/entity/color.entity';

@ObjectType()
@Entity('productDetails')
export class Details extends BaseEntity {
  @Field()
  @Column({ length: 26 })
  @Index()
  colorId: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  quantity: number;

  @Field(() => Size, { nullable: true })
  @Column({
    type: 'enum',
    enum: Size,
    nullable: true,
  })
  size?: Size;

  @Field(() => String)
  @Column({ length: 26 })
  @Index()
  productId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Field(() => CartItem)
  @OneToMany(() => CartItem, (cartItem) => cartItem.details, {
    onDelete: 'SET NULL',
  })
  cartItem: CartItem;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (orderItem) => orderItem.productDetails, {
    onDelete: 'SET NULL',
  })
  orderItems: OrderItem[];

  @Field(() => Color)
  @ManyToOne(() => Color, (Color) => Color.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'colorId' })
  color: Color;
}
