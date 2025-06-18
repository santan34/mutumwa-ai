import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { WorkspaceRole } from './WorkspaceRole';
import { WorkspacePermission } from '../public/WorkspacePermission';

@Entity({ tableName: 'workspace_role_permissions' })
export class WorkspaceRolePermission {
  @ManyToOne(() => WorkspaceRole, { primary: true })
  workspaceRole!: WorkspaceRole;

  @ManyToOne(() => WorkspacePermission, { primary: true })
  workspacePermissionId!: WorkspacePermission;

  @Property({ name: 'is_allowed' })
  isAllowed: boolean = true;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();
}