import React from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './components/App';
import { CookiesProvider } from "react-cookie";

render(
<CookiesProvider>
    <App />
</CookiesProvider>,document.getElementById('root'));