import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 as uuidv4 } from "uuid";

export enum MagicLinkPurpose {
  LOGIN = "login",
  SIGNUP = "signup",
}

@Entity({ tableName: "magic_links" })
export class MagicLinkToken {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv4();

  @Property()
  email!: string;

  @Property({ unique: true })
  token!: string;

  @Property({ type: "string", check: "purpose IN ('login', 'signup')" })
  purpose!: MagicLinkPurpose;

  @Property()
  expiresAt!: Date;

  @Property({ type: "boolean", nullable: true })
  used?: boolean;

  @Property({ name: "created_at" })
  createdAt: Date = new Date();
}