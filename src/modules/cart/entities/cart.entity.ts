import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { CartItem } from './cartItem.enitty';
import { BaseEntity } from 'src/common/bases/BaseEntity';

@Entity()
@ObjectType()
export class Cart extends BaseEntity {
  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  @Field(() => Number)
  totalPrice: number;

  @Column()
  @Field(() => String)
  @Index()
  userId: string;

  @OneToOne(() => User, (user) => user.cart, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [CartItem], { nullable: true })
  @OneToMany(() => CartItem, (CartItem) => CartItem.cart, {
    onDelete: 'SET NULL',
  })
  cartItems: CartItem[];
}
