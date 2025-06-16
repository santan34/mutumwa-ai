import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Organisation } from './Organisation';
import { Plan } from './Plan';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'organisation_plans', schema: 'public' })
export class OrganisationPlan {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne()
  organisation!: Organisation;

  @ManyToOne()
  plan!: Plan;

  @Property({ name: 'api_key', unique: true })
  apiKey!: string;

  @Property({ name: 'api_key_last_used_at', nullable: true })
  apiKeyLastUsedAt?: Date;

  @Property({ name: 'started_at' })
  startedAt: Date = new Date();

  @Property({ name: 'expires_at' })
  expiresAt!: Date;

  @Property({ name: 'is_active' })
  isActive: boolean = true;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
