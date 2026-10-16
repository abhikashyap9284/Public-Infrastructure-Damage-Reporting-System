import {demoRequest} from './demo';
export const DEMO=process.env.NEXT_PUBLIC_DEMO_MODE==='true';
export async function api(path:string,method='GET',body?:unknown):Promise<any>{
 if(DEMO){try{return await demoRequest(path,method,body);}catch(e:any){if(e.issues)throw new Error(e.issues[0]?.message||'Check the form.');throw e;}}
 const r=await fetch('/api/'+path,{method,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{throw new Error('The server returned an unexpected response. Please retry.');}if(!r.ok)throw Object.assign(new Error(data.error||'Request failed.'),{status:r.status});return data;
}
export async function allPages(path:string){let records:any[]=[];let page=0;while(page<50){const r=await api(path+'?page='+page);records.push(...r.issues);if(!r.hasMore)break;page++;}return records;}
