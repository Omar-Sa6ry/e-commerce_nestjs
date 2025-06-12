import { UserAddress } from '../../userAdress/entity/userAddress.entity';
import { AddressType } from 'src/common/constant/enum.constant';
import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { City } from 'src/modules/location/entities/city.entity';

@ObjectType()
@Entity()
export class Address extends BaseEntity {
  @Field()
  @Column({ length: 26 })
  locationId: string;

  @Field()
  @Column({ length: 255 })
  street: string;

  @Field(() => AddressType)
  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.HOME,
  })
  addressType: AddressType;

  @Field(() => City)
  @ManyToOne(() => City, (city) => city.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locationId' })
  city: City;

  @Field(() => [UserAddress], { nullable: true })
  @OneToMany(() => UserAddress, (userAddress) => userAddress.address, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  userAddresses?: UserAddress[];
}
