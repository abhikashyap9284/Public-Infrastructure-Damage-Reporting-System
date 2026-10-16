import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],define:{'process.env.NEXT_PUBLIC_DEMO_MODE':JSON.stringify('true')},build:{outDir:'dist',emptyOutDir:true}});
