import React from 'react';
import ReactDOM from 'react-dom';
import './site.css';
import JumpIn from './JumpIn';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<JumpIn />, document.getElementById('root'));
registerServiceWorker();
