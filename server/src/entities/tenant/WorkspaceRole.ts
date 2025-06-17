import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Workspace } from './Workspace';

@Entity({ tableName: 'workspace_roles' })
export class WorkspaceRole {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => Workspace)
  workspace!: Workspace;

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