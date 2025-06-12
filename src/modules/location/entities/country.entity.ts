import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Entity, Column, OneToMany } from 'typeorm';
import { City } from './city.entity';

@ObjectType()
@Entity()
export class Country extends BaseEntity {
  @Field()
  @Column({ length: 100, unique: true })
  name: string;

  @Field(() => [City])
  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
