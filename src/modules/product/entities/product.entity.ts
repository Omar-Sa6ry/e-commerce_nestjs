import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, Float } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Category } from 'src/modules/category/entity/category.entity';
import { Company } from 'src/modules/company/entity/company.entity';
import { User } from 'src/modules/users/entity/user.entity';
import { Image } from './image.entity';
import { Details } from './productDetails.entity';

@ObjectType()
@Entity('product')
export class Product extends BaseEntity {
  @Field()
  @Column({ length: 100, unique: true })
  name: string;

  @Field()
  @Column({ length: 150 })
  description: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field(() => String)
  @Column({ length: 26 })
  categoryId: string;

  @Field(() => String)
  @Column({ length: 26 })
  companyId: string;

  @Field(() => String)
  @Column({ length: 26 })
  userId: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Field(() => Company, { nullable: true })
  @ManyToOne(() => Company, (company) => company.products, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [Image])
  @OneToMany(() => Image, (image) => image.product, { cascade: true })
  images: Image[];

  @Field(() => [Details])
  @OneToMany(() => Details, (details) => details.product)
  details: Details[];

  @Field()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
