import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Country } from './country.entity';
import { Address } from 'src/modules/address/entity/address.entity';

@ObjectType()
@Entity()
export class City extends BaseEntity {
  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ length: 100, nullable: true })
  state: string;

  @Field()
  @Column({ length: 26 })
  countryId: string;

  @Field({ nullable: true })
  @Column({ length: 20, nullable: true })
  postalCode?: string;

  @Field(() => Country)
  @ManyToOne(() => Country, (country) => country.cities)
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @Field(() => [Address], { nullable: true })
  @OneToMany(() => Address, (address) => address.city, {
    onDelete: 'SET NULL',
  })
  addresses: Address[];
}
