import { UserAddress } from '../../userAdress/entity/userAddress.entity';
import { City } from 'src/modules/location/entities/city.entity';
import { Company } from 'src/modules/company/entity/company.entity';
import { AddressType } from 'src/common/constant/enum.constant';
import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import {
  Entity,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Index,
} from 'typeorm';

@ObjectType()
@Entity()
export class Address extends BaseEntity {
  @Field()
  @Column({ length: 26 })
  @Index()
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

  @Field(() => Company, { nullable: true })
  @OneToOne(() => Company, (Company) => Company.address, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  company: Company;
}
