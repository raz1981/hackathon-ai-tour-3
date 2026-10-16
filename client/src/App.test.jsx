import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { App } from './App.jsx';

test('renders the Model Comparison card', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Model Comparison' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Run across models' })).toBeInTheDocument();
});
