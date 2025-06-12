import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Address } from '../../address/entity/address.entity';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { User } from 'src/modules/users/entity/user.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@ObjectType()
@Entity()
export class UserAddress extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  userId: string;

  @Field(() => String)
  @Column({ length: 26 })
  addressId: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isDefault: boolean;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userAddresses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Address)
  @ManyToOne(() => Address, (address) => address.userAddresses)
  @JoinColumn({ name: 'addressId' })
  address: Address;
}
