import "dotenv/config";
import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

const config: Options<PostgreSqlDriver> = {
  entities: ["./dist/entities"],
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  driver: PostgreSqlDriver,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entitiesTs: ["./src/entities"],
  debug: true,
};

export default config;
