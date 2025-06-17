import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Workspace } from './Workspace';
import { User } from './User';
import { WorkspaceRole } from './WorkspaceRole';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'workspace_user_roles' })
export class WorkspaceUserRole {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => Workspace)
  workspace!: Workspace;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => WorkspaceRole)
  workspaceRole!: WorkspaceRole;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
