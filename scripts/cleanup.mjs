import {neon} from '@neondatabase/serverless';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL.');
const sql=neon(process.env.DATABASE_URL);
await sql.transaction([sql`DELETE FROM sessions WHERE expires_at<now()`,sql`DELETE FROM rate_limits WHERE reset_at<now()`]);
console.log('Expired sessions and rate limits removed.');
