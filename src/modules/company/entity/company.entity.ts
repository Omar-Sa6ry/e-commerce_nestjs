import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Address } from 'src/modules/address/entity/address.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/users/entity/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';

@Entity()
@ObjectType()
export class Company extends BaseEntity {
  @Column({ nullable: true })
  @Field(() => Int)
  @Index()
  userId: number;

  @Column({ length: 100 })
  @Field(() => String)
  name: string;

  @Column({ nullable: true })
  @Field(() => String)
  website?: string;

  @Column({ unique: true })
  @Field(() => String)
  phone: string;

  @Column({ length: 100, unique: true})
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ length: 26, nullable: true })
  @Index()
  addressId?: string;

  @Field(() => Address, { nullable: true })
  @OneToOne(() => Address, (address) => address.company, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'addressId' })
  address: Address;

  @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.company, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  products?: Product[];

  @OneToMany(() => User, (user) => user.company, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  users: User[];
}
