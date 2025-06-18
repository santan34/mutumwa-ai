export interface IOrganisation {
  id: string;
  name: string;
  domain: string;
  sector: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
