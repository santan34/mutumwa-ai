export interface IApiUsage {
  organisationId: string;
  featureId: string;
  periodStart: Date;
  usageCount: number;
  createdAt: Date;
}