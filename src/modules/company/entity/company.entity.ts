import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/users/entity/user.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

@Entity()
@ObjectType()
export class Company extends BaseEntity {
  @Column()
  @Field(() => String)
  name: string;

  @Column({ nullable: true })
  @Field(() => String)
  website?: string;

  @Column({ unique: true })
  @Field(() => String)
  phone: string;

  @Column({ nullable: true, unique: true })
  @Field(() => String)
  email: string;

  // @Field(() => Int)
  // @OneToOne(() => Address, address => address.id, { onDelete: 'SET NULL' })
  // addressId: number

  @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.company)
  products?: Product[];

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  userId: number;

  @OneToMany(() => User, (user) => user.company, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  users: User[];
}
