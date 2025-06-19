import { MikroORM, EntityName } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as tenantEntities from '../entities/tenant/index';

// Only include exported classes (entities)
const entityClasses = Object.values(tenantEntities).filter(
  (v) => typeof v === 'function' && v.prototype && v.prototype.constructor === v
);

export async function createTenantSchema(orgId: string) {
  const schemaName = `tenant_${orgId}`;

  const orm = await MikroORM.init<PostgreSqlDriver>({
    entities: entityClasses,
    dbName: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    driver: PostgreSqlDriver,
  });

  const conn = orm.em.getConnection();
  await conn.execute(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

  // Set schema on all entity metadata
  for (const meta of Object.values(orm.getMetadata().getAll())) {
    meta.schema = schemaName;
  }

  // Generate tables in new schema
  const generator = orm.getSchemaGenerator();
  await generator.createSchema();

  await orm.close();
}
