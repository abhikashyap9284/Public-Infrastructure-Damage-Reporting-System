export type Role='citizen'|'organization'|'admin';
export type Status='submitted'|'assigned'|'in_progress'|'resolved'|'rejected'|'reopened';
export type Priority='low'|'normal'|'high'|'critical';
export type Category='roads'|'streetlights'|'water'|'footpaths'|'drainage'|'waste';
export type User={id:string;name:string;email:string;role:Role;city:string;organizationId:string|null;organizationName?:string;organizationStatus?:string;active?:boolean};
export type Organization={id:string;name:string;city:string;email:string;status:'pending'|'approved'|'rejected';createdAt:string};
export type Issue={id:string;code:string;title:string;description:string;category:Category;address:string;city:string;lat:number;lng:number;status:Status;priority:Priority;createdAt:string;updatedAt:string;resolvedAt:string|null;reporterId:string;organizationId:string|null;organizationName?:string;votes:number;voted?:boolean;hasPhoto:boolean;photo?:string;rating?:number|null;dueAt:string;reopenCount?:number;events?:IssueEvent[]};
export type IssueEvent={id:string;kind:string;message:string;createdAt:string;actor:string};
export type Notice={id:string;title:string;body:string;issueId:string|null;read:boolean;createdAt:string};
export type ReportInput={title:string;description:string;category:Category;address:string;city:string;lat:number;lng:number;priority:Priority;photo:string};
export const CATEGORIES:{id:Category;label:string;short:string;color:string}[]=[
 {id:'roads',label:'Roads & potholes',short:'Roads',color:'#d38a52'},
 {id:'streetlights',label:'Streetlights',short:'Lighting',color:'#e2b541'},
 {id:'water',label:'Water supply',short:'Water',color:'#649cab'},
 {id:'footpaths',label:'Footpaths',short:'Footpaths',color:'#9d87bf'},
 {id:'drainage',label:'Drains & sewage',short:'Drainage',color:'#718e70'},
 {id:'waste',label:'Waste & sanitation',short:'Waste',color:'#b88778'}
];
export const STATUS_LABELS:Record<Status,string>={submitted:'Submitted',assigned:'Assigned',in_progress:'In progress',resolved:'Resolved',rejected:'Rejected',reopened:'Reopened'};
export const OPEN_STATUSES:Status[]=['submitted','assigned','in_progress','reopened'];
