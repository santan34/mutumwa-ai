import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { User } from './User';
import { Role } from './Role';

@Entity({ tableName: 'user_invitations' })
export class UserInvitation {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  email!: string;

  @ManyToOne(() => User)
  invitedByUser!: User;

  @ManyToOne(() => Role, { nullable: true })
  globalRole?: Role;

  @Property({ name: 'invitation_token' })
  invitationToken!: string;

  @Property({ name: 'expires_at' })
  expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  @Property()
  status: string = 'pending';

  @Property({ name: 'first_name', nullable: true })
  firstName?: string;

  @Property({ name: 'last_name', nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  message?: string;

  @Property({ name: 'accepted_at', nullable: true })
  acceptedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  acceptedByUser?: User;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}