import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { UserInvitation } from './UserInvitation';
import { User } from './User';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'invitation_audit_log' })
export class InvitationAuditLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => UserInvitation)
  invitation!: UserInvitation;

  @Property()
  action!: string;

  @ManyToOne(() => User, { nullable: true })
  performedByUser?: User;

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();
}
