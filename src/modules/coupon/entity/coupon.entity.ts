import { Field, Float, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { TypeCoupon } from 'src/common/constant/enum.constant';
import { Category } from 'src/modules/category/entity/category.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class Coupon extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  categoryId: string;

  @Column({ length: 100 })
  @Field(() => String)
  name: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount: number;

  @Field(() => TypeCoupon)
  @Column({ type: 'enum', enum: TypeCoupon })
  type: TypeCoupon;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field(() => Date)
  @Column({ type: 'timestamp' })
  expiryDate: Date;

  @Field(() => Category)
  @ManyToOne(() => Category, (Category) => Category.coupon, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  categories: Category;
}
