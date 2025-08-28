import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css'; // <-- Add this line at the top

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);