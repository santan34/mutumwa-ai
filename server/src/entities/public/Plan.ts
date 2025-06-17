import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 as uuidv4 } from "uuid";

@Entity({ tableName: "plans", schema: "public" })
export class Plan {
  @PrimaryKey({ type: "uuid" })
  id: string = uuidv4();

  @Property()
  name!: string;

  @Property()
  description?: string;

  @Property({ name: "created_at" })
  createdAt: Date = new Date();

  @Property({ name: "updated_at" })
  updatedAt: Date = new Date();
}
