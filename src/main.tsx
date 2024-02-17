import React from 'react';
import ReactDOM from 'react-dom';
import './main.scss';
import {App} from './app';
import {Router} from 'wouter';
import {basePath} from '@constants';

function AppWithBasePath() {
  return (
    <Router base={basePath}>
      <App />
    </Router>
  );
}

ReactDOM.render(React.createElement(AppWithBasePath), document.querySelector('#app'));
