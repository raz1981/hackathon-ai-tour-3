import { expect, test } from 'vitest';
import { estimateTokens, formatCost, formatTime, scoreToStars } from './format.js';

test('estimateTokens approximates one token per four characters', () => {
  expect(estimateTokens('')).toBe(0);
  expect(estimateTokens('abcd')).toBe(1);
  expect(estimateTokens('abcde')).toBe(2);
});

test('formatCost handles missing, zero, sub-cent, and normal values', () => {
  expect(formatCost(null)).toBe('—');
  expect(formatCost(0)).toBe('$0.00');
  expect(formatCost(0.0024)).toBe('$0.0024');
  expect(formatCost(0.034)).toBe('$0.03');
});

test('formatTime shows one decimal under ten seconds and whole seconds above', () => {
  expect(formatTime(null)).toBe('—');
  expect(formatTime(1830)).toBe('1.8s');
  expect(formatTime(12400)).toBe('12s');
});

test('scoreToStars maps a 1-10 score to half-star steps', () => {
  expect(scoreToStars(null)).toBeNull();
  expect(scoreToStars(7)).toBe(3.5);
  expect(scoreToStars(8)).toBe(4);
  expect(scoreToStars(10)).toBe(5);
  expect(scoreToStars(1)).toBe(0.5);
});
