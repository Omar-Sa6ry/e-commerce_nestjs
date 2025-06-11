import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Size } from 'src/common/constant/enum.constant';
import { Product } from 'src/modules/product/entities/product.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';

@ObjectType()
@Entity('productDetails')
export class Details extends BaseEntity {
  @Field()
  @Column({ length: 7 })
  color: string;

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
  @Column()
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
}
