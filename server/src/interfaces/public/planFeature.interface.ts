import { RatePeriod } from "../../entities/public/RatePeriod";

export interface IPlanFeature {
  planId: string;
  featureId: string;
  rateLimit?: number;
  period?: RatePeriod;
  createdAt: Date;
}