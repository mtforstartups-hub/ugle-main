import { Client } from "pg";

/**
 * Creates the throwaway database used by the Payload integration tests.
 *
 * Safe to run repeatedly: the database is only created when missing. Payload
 * pushes the schema itself (`db.push` is enabled outside production), so the
 * database can stay empty between runs.
 */
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://ugle:ugle@localhost:5432/ugle_test";

async function main() {
  const target = new URL(TEST_DATABASE_URL);
  const databaseName = target.pathname.replace(/^\//, "");

  if (!databaseName) {
    throw new Error(
      `TEST_DATABASE_URL is missing a database name: ${TEST_DATABASE_URL}`,
    );
  }

  // Connect through the maintenance database, which always exists.
  const maintenance = new URL(TEST_DATABASE_URL);
  maintenance.pathname = "/postgres";

  const client = new Client({ connectionString: maintenance.toString() });
  await client.connect();

  try {
    const { rowCount } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName],
    );

    if (rowCount) {
      console.log(`Test database "${databaseName}" already exists.`);
    } else {
      // Identifiers cannot be parameterised; the name comes from our own config.
      await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
      console.log(`Created test database "${databaseName}".`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
