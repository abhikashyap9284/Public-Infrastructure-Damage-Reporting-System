import type {Metadata} from 'next';
import '../src/styles.css';
export const metadata:Metadata={title:'CivicPulse · Better cities, together',description:'Report infrastructure damage, track repair progress, and build safer neighborhoods.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
