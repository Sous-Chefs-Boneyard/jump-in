import React from 'react';
import ReactDOM from 'react-dom';
import JumpIn from './JumpIn';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<JumpIn />, div);
});
