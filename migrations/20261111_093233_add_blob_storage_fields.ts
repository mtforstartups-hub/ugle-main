import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_settings" ALTER COLUMN "cta_title" DROP NOT NULL;
  ALTER TABLE "blog_settings" ALTER COLUMN "cta_button_label" DROP NOT NULL;
  ALTER TABLE "blog_settings" ALTER COLUMN "cta_button_href" DROP NOT NULL;
  ALTER TABLE "answers_settings" ALTER COLUMN "cta_title" DROP NOT NULL;
  ALTER TABLE "answers_settings" ALTER COLUMN "cta_button_label" DROP NOT NULL;
  ALTER TABLE "answers_settings" ALTER COLUMN "cta_button_href" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blog_settings" ALTER COLUMN "cta_title" SET NOT NULL;
  ALTER TABLE "blog_settings" ALTER COLUMN "cta_button_label" SET NOT NULL;
  ALTER TABLE "blog_settings" ALTER COLUMN "cta_button_href" SET NOT NULL;
  ALTER TABLE "answers_settings" ALTER COLUMN "cta_title" SET NOT NULL;
  ALTER TABLE "answers_settings" ALTER COLUMN "cta_button_label" SET NOT NULL;
  ALTER TABLE "answers_settings" ALTER COLUMN "cta_button_href" SET NOT NULL;
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "_objectkey";`)
}
