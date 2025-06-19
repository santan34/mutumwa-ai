import { Enum, Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Plan } from "./Plan";
import { Feature } from "./Feature";
import { RatePeriod } from "./RatePeriod";

@Entity({ tableName: "plan_features", schema: "public" })
export class PlanFeature {
  @ManyToOne({ primary: true })
  plan!: Plan;

  @ManyToOne({ primary: true })
  feature!: Feature;

  @Property({ name: "rate_limit", nullable: true })
  rateLimit?: number;

  @Enum({ items: () => RatePeriod, nullable: true })
  period!: RatePeriod | null;

  @Property({ name: "created_at" })
  createdAt: Date = new Date();
}
