import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Details } from 'src/modules/poductDetails/entity/productDetails.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@ObjectType()
@Entity()
export class Color extends BaseEntity {
  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => [Details])
  @OneToMany(() => Details, (Details) => Details.color, {
    onDelete: 'SET NULL',
  })
  details: Details[];
}
