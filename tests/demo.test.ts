import {test} from 'node:test';
import assert from 'node:assert/strict';
import {demoRequest,enterDemo,resetDemo} from '../src/demo';
const memory=new Map<string,string>();
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>memory.get(k)||null,setItem:(k:string,v:string)=>memory.set(k,v),removeItem:(k:string)=>memory.delete(k)}});

test('demo persists records, handles paged paths, and keeps its roles explicit',async()=>{
 const initial=await demoRequest('auth/session','GET');assert.equal(initial.user.role,'citizen');
 const reports=await demoRequest('issues?page=0','GET');assert.equal(reports.issues.length,6);assert.equal((await demoRequest('community?page=0','GET')).issues.length,9);
 await enterDemo('admin');const organizations=(await demoRequest('organizations','GET')).organizations;const pending=organizations.find((o:any)=>o.status==='pending');assert.ok(pending);
 await demoRequest('organizations/'+pending.id,'PATCH',{status:'approved'});assert.equal((await demoRequest('organizations','GET')).organizations.find((o:any)=>o.id===pending.id).status,'approved');
 const organization=await enterDemo('organization');const queue=(await demoRequest('issues?page=0','GET')).issues;assert.ok(queue.length);assert.ok(queue.every((i:any)=>i.organizationId===organization.organizationId));
 const citizen=await enterDemo('citizen');await demoRequest('profile','PATCH',{name:'Demo Updated',city:'Noida'});assert.equal((await demoRequest('auth/session','GET')).user.name,'Demo Updated');
 await demoRequest('auth/logout','POST',{});assert.equal((await demoRequest('auth/session','GET')).user,null);
 await assert.rejects(()=>demoRequest('auth/login','POST',{email:citizen.email,password:'wrong'}));assert.equal((await demoRequest('auth/login','POST',{email:citizen.email,password:'Demo@2026!'})).user.id,citizen.id);
 const registered=await demoRequest('auth/register','POST',{name:'Demo New Team',email:'newteam@example.com',password:'NewDemoPass123!',role:'organization',organizationName:'New Team',city:'Noida'});assert.equal(registered.user.organizationStatus,'pending');assert.equal((await demoRequest('issues','GET')).issues.length,0);
 await resetDemo();assert.equal((await demoRequest('auth/session','GET')).user.name,'Abhi Kashyap');assert.equal((await demoRequest('community','GET')).issues.length,9);
});
