import { MikroORM, Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Organisation } from "../entities/public/Organisation";
import "dotenv/config";
const config: Options<PostgreSqlDriver> = {
  entities: ["./dist/entities"],
  dbName: process.env.DB_NAME,
  driver: PostgreSqlDriver,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entitiesTs: ["./src/entities"],
  debug: true,
};

export let orm: MikroORM<PostgreSqlDriver>;

export const initializeORM = async () => {
  orm = await MikroORM.init<PostgreSqlDriver>(config);
  return orm;
};

export { config };
