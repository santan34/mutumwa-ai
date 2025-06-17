import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { WorkspaceRole } from './WorkspaceRole';

@Entity({ tableName: 'workspace_role_permissions' })
export class WorkspaceRolePermission {
  @ManyToOne(() => WorkspaceRole, { primary: true })
  workspaceRole!: WorkspaceRole;

  @Property({ name: 'workspace_permission_id', type: 'uuid' })
  workspacePermissionId!: string;

  @Property({ name: 'is_allowed' })
  isAllowed: boolean = true;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();
}