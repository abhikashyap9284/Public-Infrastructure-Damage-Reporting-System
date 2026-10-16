import {neon} from '@neondatabase/serverless';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL in .env.local first.');
const sql=neon(process.env.DATABASE_URL);
const statements=(await readFile(new URL('./schema.sql',import.meta.url),'utf8')).split(';').map(x=>x.trim()).filter(Boolean);
await sql.transaction(statements.map(s=>sql.query(s)));
console.log('CivicPulse database schema v1 is ready. Existing records were preserved.');
