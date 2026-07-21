import postgres from 'postgres';
import { env } from './lib/config/env';

const sql = postgres(env.DATABASE_URL);

sql`select * from users where github_id = '182542659' limit 1`
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0));
