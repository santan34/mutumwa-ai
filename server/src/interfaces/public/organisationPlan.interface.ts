export interface IOrganisationPlan {
  id: string;
  organisationId: string;
  planId: string;
  apiKey: string;
  apiKeyLastUsedAt?: Date;
  startedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}