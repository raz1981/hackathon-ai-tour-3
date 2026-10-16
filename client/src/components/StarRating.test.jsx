import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { StarRating } from './StarRating.jsx';

test('renders full, half, and empty stars with an accessible label', () => {
  const { container } = render(<StarRating value={3.5} />);

  expect(screen.getByRole('img', { name: '3.5 out of 5' })).toBeInTheDocument();
  expect(container.querySelectorAll('.star-full')).toHaveLength(3);
  expect(container.querySelectorAll('.star-half')).toHaveLength(1);
  expect(container.querySelectorAll('.star-empty')).toHaveLength(1);
});

test('renders a full rating', () => {
  const { container } = render(<StarRating value={5} />);
  expect(container.querySelectorAll('.star-full')).toHaveLength(5);
});

test('shows "Not scored" when there is no rating', () => {
  render(<StarRating value={null} />);
  expect(screen.getByText('Not scored')).toBeInTheDocument();
});
