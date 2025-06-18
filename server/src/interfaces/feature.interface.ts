export interface IFeature {
  id: string;
  name: string;
  endpointPath: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
