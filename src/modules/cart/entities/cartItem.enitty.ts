import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Cart } from './cart.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class CartItem extends BaseEntity {
  @Field(() => String)
  @Column()
  productId: string;

  @Column()
  @Field(() => String)
  detailsId: string;

  @Column()
  @Field(() => Int)
  quantity: number;

  @Column('numeric', { precision: 10, scale: 2 })
  @Field(() => Number)
  totalPrice: number;

  @Field()
  @Column()
  cartId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.cartItem, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Field(() => Details)
  @ManyToOne(() => Details, (Details) => Details.cartItem, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'detailsId' })
  details: Details;

  @Field(() => Cart)
  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    onDelete: 'CASCADE',
  })
  cart: Cart;
}
