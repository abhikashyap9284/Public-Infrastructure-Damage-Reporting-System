import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {hash} from 'bcryptjs';
import {handle} from '../src/server';
import {setTestDatabase,query} from '../src/db';
import {canTransition,distanceMeters,csvCell,stats,passwordSchema} from '../src/rules';

(process.env as Record<string,string>).NODE_ENV='test';
process.env.APP_URL='http://localhost:3000';
const db=new PGlite();
const pass='TestingPass123!';
const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJWQAAAAASUVORK5CYII=';
let citizen:any,authority:any,admin:any,other:any,issueId:string,orgId:string;
async function call(path:string,method='GET',data?:any,cookie?:string,origin='http://localhost:3000'){
 const response=await handle(new Request('http://localhost:3000/api/'+path,{method,headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},...(data===undefined?{}:{body:JSON.stringify(data)})}));
 const c=response.headers.get('set-cookie')?.split(';')[0];const out=response.headers.get('content-type')?.includes('application/json')?await response.json():await response.arrayBuffer();return {status:response.status,body:out,cookie:c,headers:response.headers};
}
async function register(email:string,role='citizen',organizationName?:string){const r=await call('auth/register','POST',{name:'Test '+role,email,password:pass,role,city:'Noida',organizationName});assert.equal(r.status,201,JSON.stringify(r.body));return {user:r.body.user,cookie:r.cookie};}
before(async()=>{
 await db.exec(await readFile(new URL('../scripts/schema.sql',import.meta.url),'utf8'));
 setTestDatabase({query:async(text,params)=>(await db.query(text,params)).rows as any[],atomic:async(statements)=>db.transaction(async tx=>{const results=[];for(const s of statements)results.push((await tx.query(s.text,s.params||[])).rows);return results;})});
 citizen=await register('citizen@test.example');authority=await register('authority@test.example','organization','Test Public Works');other=await register('other@test.example');orgId=authority.user.organizationId;
 const adminId=randomUUID();await query(`INSERT INTO users(id,full_name,email,password_hash,role,city) VALUES($1,'Test Admin','admin@test.example',$2,'admin','Noida')`,[adminId,await hash(pass,4)]);const r=await call('auth/login','POST',{email:'admin@test.example',password:pass});assert.equal(r.status,200);admin={user:r.body.user,cookie:r.cookie};
});
after(async()=>{await db.close();});

test('database health and protected session responses',async()=>{
 assert.equal((await call('health')).status,200);assert.equal((await call('auth/session')).body.user,null);assert.equal((await call('issues')).status,401);
 const r=await call('auth/session','GET',undefined,citizen.cookie);assert.equal(r.body.user.role,'citizen');assert.equal(r.body.user.password_hash,undefined);
 const [s]=await query('SELECT token_hash FROM sessions WHERE user_id=$1',[citizen.user.id]);assert.equal(s.token_hash.length,64);assert.notEqual(s.token_hash,citizen.cookie.split('=')[1]);
});
test('registration denies admin role and duplicate emails',async()=>{
 const b={name:'Bad Admin',email:'bad@test.example',password:pass,role:'admin',city:'Noida'};assert.equal((await call('auth/register','POST',b)).status,400);
 assert.equal((await call('auth/register','POST',{...b,role:'citizen',email:'citizen@test.example'})).status,409);
});
test('credentials and cross-origin writes are checked',async()=>{
 assert.equal((await call('auth/login','POST',{email:'citizen@test.example',password:'incorrect'})).status,401);
 assert.equal((await call('auth/logout','POST',{},citizen.cookie,'https://attacker.example')).status,403);
});
test('citizen submits photo and location; issue, timeline and notice persist',async()=>{
 const input={title:'Large pothole near metro entrance',description:'A large pothole is creating a hazard for residents and commuters.',category:'roads',address:'Sector 62, metro gate 2',city:'Noida',lat:28.6275,lng:77.3725,priority:'high',photo};
 assert.equal((await call('issues','POST',{...input,photo:'data:image/png;base64,'+Buffer.alloc(60).toString('base64')},citizen.cookie)).status,400);
 const r=await call('issues','POST',input,citizen.cookie);assert.equal(r.status,201,JSON.stringify(r.body));issueId=r.body.issue.id;assert.equal(r.body.issue.status,'submitted');assert.ok(r.body.issue.code.startsWith('CP-'));
 const detail=await call('issues/'+issueId,'GET',undefined,citizen.cookie);assert.equal(detail.body.issue.events.length,1);assert.equal((await call('issues/'+issueId+'/photo','GET',undefined,citizen.cookie)).headers.get('content-type'),'image/png');
 const publicData=await call('community');assert.equal(publicData.body.issues[0].reporterId,'');assert.equal(publicData.body.issues[0].photo,undefined);
});
test('organization registration is pending and privileged actions remain protected',async()=>{
 assert.equal(authority.user.organizationStatus,'pending');assert.equal((await call('users','GET',undefined,citizen.cookie)).status,403);
 assert.equal((await call('issues/'+issueId+'/assign','PATCH',{organizationId:orgId,priority:'high'},citizen.cookie)).status,403);
 assert.equal((await call('issues/'+issueId+'/status','PATCH',{status:'in_progress',message:'Trying an unauthorized repair update.'},authority.cookie)).status,403);
 assert.equal((await call('issues','GET',undefined,authority.cookie)).body.issues.length,0);
});
test('admin approves organization, assigns work and exposes only its scoped queue',async()=>{
 const r=await call('organizations/'+orgId,'PATCH',{status:'approved'},admin.cookie);assert.equal(r.status,200,JSON.stringify(r.body));
 const a=await call('issues/'+issueId+'/assign','PATCH',{organizationId:orgId,priority:'high'},admin.cookie);assert.equal(a.status,200,JSON.stringify(a.body));
 assert.equal((await call('issues','GET',undefined,authority.cookie)).body.issues.length,1);assert.equal((await call('issues','GET',undefined,other.cookie)).body.issues.length,0);
 const notices=await call('notifications','GET',undefined,authority.cookie);assert.ok(notices.body.notifications.some((n:any)=>n.title==='New report assigned'));
});
test('authority cannot assign work or manage another organization',async()=>{
 assert.equal((await call('organizations/'+orgId,'PATCH',{status:'rejected'},authority.cookie)).status,403);
 const different=await register('different-org@test.example','organization','Other Team');assert.equal((await call('issues/'+issueId+'/status','PATCH',{status:'in_progress',message:'Unauthorized organization is trying to change the report.'},different.cookie)).status,403);
});
test('votes are idempotent and public comments are recorded',async()=>{
 for(let n=0;n<2;n++)assert.equal((await call('issues/'+issueId+'/vote','POST',{voted:true},other.cookie)).status,200);
 const d=await call('issues/'+issueId,'GET',undefined,other.cookie);assert.equal(d.body.issue.votes,1);assert.equal(d.body.issue.voted,true);assert.equal(d.body.issue.reporterId,'');
 assert.equal((await call('issues/'+issueId+'/comments','POST',{message:'This is also affecting the bus stop nearby.'},other.cookie)).status,200);
 assert.equal((await call('issues/'+issueId+'/vote','POST',{voted:false},other.cookie)).status,200);
});
test('authority progresses and resolves reports with a required note',async()=>{
 const base='issues/'+issueId+'/status';assert.equal((await call(base,'PATCH',{status:'resolved',message:'Trying to skip the repair stage.'},authority.cookie)).status,409);
 assert.equal((await call(base,'PATCH',{status:'in_progress',message:'The field team has inspected the road and started repairs.'},authority.cookie)).status,200);
 assert.equal((await call(base,'PATCH',{status:'resolved',message:'Fixed'},authority.cookie)).status,400);
 assert.equal((await call(base,'PATCH',{status:'resolved',message:'Pothole filled and the surface has been checked for safe traffic.'},authority.cookie)).status,200);
 const d=await call('issues/'+issueId,'GET',undefined,citizen.cookie);assert.ok(d.body.issue.resolvedAt);assert.equal(d.body.issue.status,'resolved');
});
test('only the reporter can leave repair feedback or reopen the issue',async()=>{
 assert.equal((await call('issues/'+issueId+'/rating','POST',{rating:5},other.cookie)).status,403);
 assert.equal((await call('issues/'+issueId+'/rating','POST',{rating:5},citizen.cookie)).status,200);
 assert.equal((await call('issues/'+issueId+'/status','PATCH',{status:'reopened',message:'The repair has deteriorated after rain.'},other.cookie)).status,403);
 assert.equal((await call('issues/'+issueId+'/status','PATCH',{status:'reopened',message:'The repair has deteriorated after rain. Please inspect again.'},citizen.cookie)).status,200);
 const [r]=await query('SELECT status,rating,resolved_at,reopen_count FROM issues WHERE id=$1',[issueId]);assert.equal(r.status,'reopened');assert.equal(r.rating,null);assert.equal(r.resolved_at,null);assert.equal(r.reopen_count,1);
});
test('revoking organization approval immediately blocks repair access',async()=>{
 assert.equal((await call('organizations/'+orgId,'PATCH',{status:'rejected'},admin.cookie)).status,200);
 assert.equal((await call('issues','GET',undefined,authority.cookie)).body.issues.length,0);
 assert.equal((await call('issues/'+issueId+'/status','PATCH',{status:'in_progress',message:'Trying to proceed after approval was revoked.'},authority.cookie)).status,403);
});
test('admin cannot disable admin accounts; disabled users lose all sessions',async()=>{
 assert.equal((await call('users/'+admin.user.id,'PATCH',{active:false},admin.cookie)).status,400);
 assert.equal((await call('users/'+other.user.id,'PATCH',{active:false},admin.cookie)).status,200);
 assert.equal((await call('auth/session','GET',undefined,other.cookie)).body.user,null);
 assert.equal((await call('auth/login','POST',{email:other.user.email,password:pass})).status,401);
});
test('notification read state and profile persist',async()=>{
 assert.equal((await call('notifications','PATCH',{},citizen.cookie)).status,200);const r=await call('notifications','GET',undefined,citizen.cookie);assert.ok(r.body.notifications.every((n:any)=>n.read));
 const p=await call('profile','PATCH',{name:'Updated Citizen',city:'Delhi'},citizen.cookie);assert.equal(p.status,200);assert.equal((await call('auth/session','GET',undefined,citizen.cookie)).body.user.name,'Updated Citizen');
});
test('password changes invalidate old sessions and the old password',async()=>{
 assert.equal((await call('auth/password','POST',{currentPassword:'wrong',password:'NewTesting123!'},citizen.cookie)).status,400);
 const r=await call('auth/password','POST',{currentPassword:pass,password:'NewTesting123!'},citizen.cookie);assert.equal(r.status,200);assert.ok(r.headers.get('set-cookie')?.includes('Max-Age=0'));
 assert.equal((await call('auth/session','GET',undefined,citizen.cookie)).body.user,null);assert.equal((await call('auth/login','POST',{email:citizen.user.email,password:pass})).status,401);
 const fresh=await call('auth/login','POST',{email:citizen.user.email,password:'NewTesting123!'});assert.equal(fresh.status,200);citizen.cookie=fresh.cookie;
});
test('logout revokes the server-side session',async()=>{assert.equal((await call('auth/logout','POST',{},citizen.cookie)).status,200);assert.equal((await call('issues','GET',undefined,citizen.cookie)).status,401);});
test('login rate limiting persists in the database',async()=>{for(let n=0;n<10;n++)assert.equal((await call('auth/login','POST',{email:'brute@test.example',password:'incorrect'})).status,401);assert.equal((await call('auth/login','POST',{email:'brute@test.example',password:'incorrect'})).status,429);});
test('geographic distance, transitions, passwords and CSV protection',()=>{
 assert.equal(canTransition('citizen','submitted','resolved',true),false);assert.equal(canTransition('organization','in_progress','resolved',false),true);assert.equal(distanceMeters({lat:28.6,lng:77.3},{lat:28.6,lng:77.3}),0);assert.ok(distanceMeters({lat:28.6,lng:77.3},{lat:28.601,lng:77.3})<120);
 assert.equal(csvCell('=SUM(A1)'),`"'=SUM(A1)"`);assert.equal(csvCell('a"b'),'"a""b"');assert.equal(passwordSchema.safeParse('weak').success,false);assert.equal(stats([]).rate,0);
});
