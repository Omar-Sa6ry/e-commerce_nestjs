import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Coupon } from 'src/modules/coupon/entity/coupon.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';

@ObjectType()
@Entity('category')
export class Category extends BaseEntity {
  @Field()
  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @Field(() => Coupon)
  @OneToMany(() => Coupon, (Coupon) => Coupon.categories, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  coupon: Coupon;
}
