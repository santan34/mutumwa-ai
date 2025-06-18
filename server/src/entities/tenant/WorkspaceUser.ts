import { Entity, Property, ManyToOne } from '@mikro-orm/core';
import { Workspace } from './Workspace';
import { User } from './User';

@Entity({ tableName: 'workspace_users' })
export class WorkspaceUser {
  @ManyToOne(() => Workspace, { primary: true })
  workspace!: Workspace;

  @ManyToOne(() => User, { primary: true })
  user!: User;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}