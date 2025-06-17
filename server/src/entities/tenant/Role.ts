import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'roles' })
export class Role {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}