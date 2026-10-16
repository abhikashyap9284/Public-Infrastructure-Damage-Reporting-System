import React from 'react';
import {createRoot} from 'react-dom/client';
import CivicApp from './app-client';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><CivicApp/></React.StrictMode>);
