import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@ObjectType()
@Entity('category')
export class Category extends BaseEntity {
  @Field()
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}
