import {neon} from '@neondatabase/serverless';
export type Statement={text:string;params?:unknown[]};
export type Adapter={query:(text:string,params:unknown[])=>Promise<Record<string,any>[]>;atomic:(statements:Statement[])=>Promise<any[]>};
let testAdapter:Adapter|undefined;
export function setTestDatabase(adapter:Adapter){if(process.env.NODE_ENV!=='test')throw new Error('Test adapter is disabled.');testAdapter=adapter;}
function client(){const url=process.env.DATABASE_URL;if(!url||!/^postgres(ql)?:\/\//.test(url))throw Object.assign(new Error('Database is not configured. Add DATABASE_URL to .env.local and run npm run db:migrate.'),{status:503});return neon(url);}
export async function query(text:string,params:unknown[]=[]):Promise<Record<string,any>[]>{if(testAdapter)return testAdapter.query(text,params);return await client().query(text,params) as Record<string,any>[];}
export async function atomic(statements:Statement[]){if(testAdapter)return testAdapter.atomic(statements);const sql=client();return sql.transaction(statements.map(x=>sql.query(x.text,x.params||[])));}
