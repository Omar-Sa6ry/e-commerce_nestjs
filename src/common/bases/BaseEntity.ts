import { ulid } from 'ulid';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeOrmBaseEntity,
  AfterInsert,
  AfterUpdate,
  BeforeRemove,
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

  protected get entityName(): string {
    return this.constructor.name;
  }

  @AfterInsert()
  logInsert() {
    console.log(`Inserted ${this.entityName} with id: ${this.id}`);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`Updated ${this.entityName} with id: ${this.id}`);
  }

  @BeforeRemove()
  logRemove() {
    console.log(`Removed ${this.entityName} with id: ${this.id}`);
  }
}
