import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 as uuidv4 } from "uuid";

@Entity({ tableName: "organisations", schema: "public" })
export class Organisation {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv4();

  @Property({ unique: true })
  name!: string;

  @Property({ unique: true })
  domain!: string;

  @Property({ nullable: true })
  sector?: string;

  @Property({ name: "created_at" })
  createdAt: Date = new Date();

  @Property({ name: "updated_at" })
  updatedAt: Date = new Date();

  @Property({ name: "deleted_at", nullable: true })
  deletedAt?: Date | null; // Add null as possible type
}
