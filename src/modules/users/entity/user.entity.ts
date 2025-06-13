import { ObjectType, Field } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Role } from 'src/common/constant/enum.constant';
import { Order } from 'src/modules/order/entities/order.entity';
import { UserAddress } from 'src/modules/userAdress/entity/userAddress.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Company } from 'src/modules/company/entity/company.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@ObjectType()
@Entity('user')
export class User extends BaseEntity {
  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  fullName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field()
  @Column({ unique: true })
  phone: string;

  @Field()
  @Column({ unique: true })
  @Index()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Exclude()
  @Column({ nullable: true })
  resetToken?: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null;

  @Exclude()
  @Column({ nullable: true })
  fcmToken?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => [Product], { nullable: true })
  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @Field(() => [UserAddress], { nullable: true })
  @OneToMany(() => UserAddress, (UserAddress) => UserAddress.user)
  userAddresses: UserAddress[];

  @Field(() => Cart, { nullable: true })
  @OneToOne(() => Cart, (cart) => cart.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  cart: Cart;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (Order) => Order.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  orders: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  updateFullName() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
}
