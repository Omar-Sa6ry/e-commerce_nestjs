import { ulid } from 'ulid';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

@ObjectType()
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @Field(() => ID)
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string = ulid();

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
