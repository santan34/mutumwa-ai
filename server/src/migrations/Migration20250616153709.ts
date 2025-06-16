import { Migration } from '@mikro-orm/migrations';

export class Migration20250616153709 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "features" ("id" uuid not null, "name" varchar(255) not null, "endpoint_path" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, constraint "features_pkey" primary key ("id"));`);

    this.addSql(`create table "organisations" ("id" uuid not null, "name" varchar(255) not null, "domain" varchar(255) not null, "sector" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, constraint "organisations_pkey" primary key ("id"));`);
    this.addSql(`alter table "organisations" add constraint "organisations_domain_unique" unique ("domain");`);

    this.addSql(`create table "api_usage" ("organisation_id" uuid not null, "feature_id" uuid not null, "period_start" timestamptz not null, "usage_count" int not null default 0, "created_at" timestamptz not null, constraint "api_usage_pkey" primary key ("organisation_id", "feature_id", "period_start"));`);

    this.addSql(`create table "organisational_permissions" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, constraint "organisational_permissions_pkey" primary key ("id"));`);
    this.addSql(`alter table "organisational_permissions" add constraint "organisational_permissions_name_unique" unique ("name");`);

    this.addSql(`create table "plans" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "plans_pkey" primary key ("id"));`);

    this.addSql(`create table "organisation_plans" ("id" uuid not null, "organisation_id" uuid not null, "plan_id" uuid not null, "api_key" varchar(255) not null, "api_key_last_used_at" timestamptz null, "started_at" timestamptz not null, "expires_at" timestamptz not null, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, constraint "organisation_plans_pkey" primary key ("id"));`);
    this.addSql(`alter table "organisation_plans" add constraint "organisation_plans_api_key_unique" unique ("api_key");`);

    this.addSql(`create table "plan_features" ("plan_id" uuid not null, "feature_id" uuid not null, "rate_limit" int null, "period" text check ("period" in ('second', 'minute', 'hour', 'day', 'month')) null, "created_at" timestamptz not null, constraint "plan_features_pkey" primary key ("plan_id", "feature_id"));`);

    this.addSql(`create table "system_admins" ("id" uuid not null, "email" varchar(255) not null, "name" varchar(255) not null, "is_super_admin" boolean not null default false, "is_active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "system_admins_pkey" primary key ("id"));`);
    this.addSql(`alter table "system_admins" add constraint "system_admins_email_unique" unique ("email");`);

    this.addSql(`create table "workspace_permissions" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" timestamptz null, constraint "workspace_permissions_pkey" primary key ("id"));`);
    this.addSql(`alter table "workspace_permissions" add constraint "workspace_permissions_name_unique" unique ("name");`);

    this.addSql(`alter table "api_usage" add constraint "api_usage_organisation_id_foreign" foreign key ("organisation_id") references "organisations" ("id") on update cascade;`);
    this.addSql(`alter table "api_usage" add constraint "api_usage_feature_id_foreign" foreign key ("feature_id") references "features" ("id") on update cascade;`);

    this.addSql(`alter table "organisation_plans" add constraint "organisation_plans_organisation_id_foreign" foreign key ("organisation_id") references "organisations" ("id") on update cascade;`);
    this.addSql(`alter table "organisation_plans" add constraint "organisation_plans_plan_id_foreign" foreign key ("plan_id") references "plans" ("id") on update cascade;`);

    this.addSql(`alter table "plan_features" add constraint "plan_features_plan_id_foreign" foreign key ("plan_id") references "plans" ("id") on update cascade;`);
    this.addSql(`alter table "plan_features" add constraint "plan_features_feature_id_foreign" foreign key ("feature_id") references "features" ("id") on update cascade;`);
  }

}
