import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // optional if you want to style things with CSS
import Game from './app';

ReactDOM.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
);
