import { Entity, PrimaryKey, Property, OneToOne } from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'profiles' })
export class Profile {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @OneToOne(() => User)
  user!: User;

  @Property({ name: 'first_name', nullable: true })
  firstName?: string;

  @Property({ name: 'last_name', nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  gender?: string;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
