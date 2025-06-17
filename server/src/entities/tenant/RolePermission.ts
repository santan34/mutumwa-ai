import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Role } from './Role';

@Entity({ tableName: 'role_permissions' })
export class RolePermission {
  @ManyToOne(() => Role, { primary: true })
  role!: Role;

  @Property({ name: 'permission_id', type: 'uuid' })
  permissionId!: string;

  @Property({ name: 'is_allowed' })
  isAllowed: boolean = true;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();
}