import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Product } from './product.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';

@ObjectType()
@Entity('image')
export class Image extends BaseEntity {
  @Field()
  @Column({ length: 255 })
  path: string;

  @Field(() => String)
  @Column({ length: 16 })
  @Index()
  productId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
