import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../lib/db.js';

async function run() {
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('✅ Migrations applied');
  await pool.end();
}
run().catch((e) => { console.error(e); process.exit(1); });
