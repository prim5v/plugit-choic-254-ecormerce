import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import axios from 'axios';

// Set default base URL for axios
axios.defaults.baseURL = 'https://biz4293.pythonanywhere.com';

const container = document.getElementById('root');
const root = createRoot(container);  // createRoot instead of render
root.render(<App />);
