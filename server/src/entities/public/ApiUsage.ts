import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Organisation } from './Organisation';
import { Feature } from './Feature';

@Entity({ tableName: 'api_usage', schema: 'public' })
export class ApiUsage {
  @ManyToOne({ primary: true })
  organisation!: Organisation;

  @ManyToOne({ primary: true })
  feature!: Feature;

  @Property({ name: 'period_start', primary: true })
  periodStart!: Date;

  @Property({ name: 'usage_count' })
  usageCount: number = 0;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();
}
