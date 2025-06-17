import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { UserInvitation } from './UserInvitation';
import { Workspace } from './Workspace';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'invitation_workspace_assignments' })
export class InvitationWorkspaceAssignment {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @ManyToOne(() => UserInvitation)
  invitation!: UserInvitation;

  @ManyToOne(() => Workspace)
  workspace!: Workspace;

  @Property({ name: 'workspace_role_ids', type: 'uuid[]' })
  workspaceRoleIds!: string[];

  @Property({ name: 'created_at' })
  createdAt: Date = new Date();

  @Property({ name: 'updated_at' })
  updatedAt: Date = new Date();

  @Property({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
