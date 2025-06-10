import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Product } from './product.entity';
import { Size } from 'src/common/constant/enum.constant';

@ObjectType()
@Entity('productDetails')
export class Details {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

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
}
