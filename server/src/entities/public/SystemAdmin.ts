import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'system_admins', schema: 'public' })
export class SystemAdmin {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ unique: true })
  email!: string;

  @Property()
  name!: string;

  @Property({ name: 'is_super_admin' })
  isSuperAdmin: boolean = false;

  @Property({ name: 'is_active' })
  isActive: boolean = true;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();
}