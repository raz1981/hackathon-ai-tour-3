import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { PromptForm } from './PromptForm.jsx';

const prompt = () => screen.getByLabelText('Prompt');
const runButton = () => screen.getByRole('button', { name: 'Run across models' });

test('disables the run button until a prompt is entered', () => {
  render(<PromptForm onSubmit={vi.fn()} />);
  expect(runButton()).toBeDisabled();

  fireEvent.change(prompt(), { target: { value: 'hi' } });
  expect(runButton()).toBeEnabled();
});

test('shows character and estimated token counts', () => {
  render(<PromptForm onSubmit={vi.fn()} />);
  fireEvent.change(prompt(), { target: { value: 'abcdefgh' } });
  expect(screen.getByText(/8 characters · ~2 tokens/)).toBeInTheDocument();
});

test('submits the trimmed prompt', () => {
  const onSubmit = vi.fn();
  render(<PromptForm onSubmit={onSubmit} />);
  fireEvent.change(prompt(), { target: { value: '  hello  ' } });
  fireEvent.click(runButton());
  expect(onSubmit).toHaveBeenCalledWith('hello');
});

test('submits with Ctrl+Enter', () => {
  const onSubmit = vi.fn();
  render(<PromptForm onSubmit={onSubmit} />);
  fireEvent.change(prompt(), { target: { value: 'hello' } });
  fireEvent.keyDown(prompt(), { key: 'Enter', ctrlKey: true });
  expect(onSubmit).toHaveBeenCalledWith('hello');
});

test('plain Enter does not submit', () => {
  const onSubmit = vi.fn();
  render(<PromptForm onSubmit={onSubmit} />);
  fireEvent.change(prompt(), { target: { value: 'hello' } });
  fireEvent.keyDown(prompt(), { key: 'Enter' });
  expect(onSubmit).not.toHaveBeenCalled();
});

test('does not submit a blank prompt or while disabled', () => {
  const onSubmit = vi.fn();
  const { rerender } = render(<PromptForm onSubmit={onSubmit} />);
  fireEvent.change(prompt(), { target: { value: '   ' } });
  fireEvent.keyDown(prompt(), { key: 'Enter', metaKey: true });
  expect(onSubmit).not.toHaveBeenCalled();

  fireEvent.change(prompt(), { target: { value: 'hello' } });
  rerender(<PromptForm onSubmit={onSubmit} disabled />);
  expect(runButton()).toBeDisabled();
  fireEvent.keyDown(prompt(), { key: 'Enter', ctrlKey: true });
  expect(onSubmit).not.toHaveBeenCalled();
});
