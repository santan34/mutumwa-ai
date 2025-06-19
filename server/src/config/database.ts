import { MikroORM, Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import "dotenv/config";

const config: Options<PostgreSqlDriver> = {
  entities: ["./dist/entities"],
  dbName: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  driver: PostgreSqlDriver,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entitiesTs: ["./src/entities"],
  debug: true,
  pool: {
    min: 2, // Minimum number of connections to keep alive
    max: 10, // Maximum number of connections allowed
  },
};

export let orm: MikroORM<PostgreSqlDriver>;

export const initializeORM = async () => {
  orm = await MikroORM.init<PostgreSqlDriver>(config);
  return orm;
};

export { config };
