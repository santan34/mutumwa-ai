import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Role } from './Role';

@Entity({ tableName: 'user_roles' })
export class UserRole {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Role)
  role!: Role;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}