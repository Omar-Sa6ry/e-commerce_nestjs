import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { Column, Entity } from 'typeorm';

@ObjectType()
@Entity('category')
export class Category extends BaseEntity {
  @Field()
  @Column({ type: 'varchar', length: 100 })
  name: string;
}
