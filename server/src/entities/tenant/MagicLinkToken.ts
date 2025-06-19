import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { User } from "./User";
import { v4 as uuidv4 } from "uuid";

@Entity({ tableName: "magic_link_tokens" })
export class MagicLinkToken {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv4();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  token!: string;

  @Property()
  expiresAt!: Date;

  @Property({ name: "created_at" })
  createdAt: Date = new Date();
}