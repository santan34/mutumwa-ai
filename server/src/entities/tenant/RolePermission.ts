import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Role } from './Role';
import { OrganisationalPermission }  from '../public/OrganisationalPermission';

@Entity({ tableName: 'role_permissions' })
export class RolePermission {
  @ManyToOne(() => Role, { primary: true })
  role!: Role;

  @ManyToOne(() => OrganisationalPermission, { primary: true})
  permissionId!: OrganisationalPermission;

  @Property({ name: 'is_allowed' })
  isAllowed: boolean = true;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();
}