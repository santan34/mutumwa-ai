import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'features', schema: 'public' })
export class Feature {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  name!: string;

  @Property({ name: 'endpoint_path' })
  endpointPath!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
