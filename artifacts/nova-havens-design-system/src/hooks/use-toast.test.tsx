// @vitest-environment jsdom

import * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastAction } from '../components/ui/toast';
import { Toaster } from '../components/ui/toaster';
import { reducer, toast } from './use-toast';

const firstToast = {
  id: 'first',
  open: true,
  title: 'First message',
};

const secondToast = {
  id: 'second',
  open: true,
  title: 'Second message',
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('toast lifecycle reducer', () => {
  it('adds a toast and keeps only the newest toast', () => {
    const added = reducer({ toasts: [] }, {
      type: 'ADD_TOAST',
      toast: firstToast,
    });

    expect(added.toasts).toEqual([firstToast]);

    const limited = reducer(added, {
      type: 'ADD_TOAST',
      toast: secondToast,
    });

    expect(limited.toasts).toEqual([secondToast]);
  });

  it('updates only the requested toast', () => {
    const state = reducer({ toasts: [firstToast] }, {
      type: 'UPDATE_TOAST',
      toast: { id: firstToast.id, title: 'Updated message' },
    });

    expect(state.toasts[0]).toMatchObject({
      id: firstToast.id,
      title: 'Updated message',
      open: true,
    });
  });

  it('dismisses one toast or every toast without removing them immediately', () => {
    vi.useFakeTimers();

    const oneDismissed = reducer({ toasts: [firstToast, secondToast] }, {
      type: 'DISMISS_TOAST',
      toastId: firstToast.id,
    });

    expect(oneDismissed.toasts).toEqual([
      { ...firstToast, open: false },
      secondToast,
    ]);

    const allDismissed = reducer({ toasts: [firstToast, secondToast] }, {
      type: 'DISMISS_TOAST',
    });

    expect(allDismissed.toasts).toEqual([
      { ...firstToast, open: false },
      { ...secondToast, open: false },
    ]);
  });

  it('removes one toast or clears every toast', () => {
    const oneRemoved = reducer({ toasts: [firstToast, secondToast] }, {
      type: 'REMOVE_TOAST',
      toastId: firstToast.id,
    });

    expect(oneRemoved.toasts).toEqual([secondToast]);
    expect(reducer(oneRemoved, { type: 'REMOVE_TOAST' }).toasts).toEqual([]);
  });
});

describe('shared Toaster output', () => {
  it('reflects updates triggered by an action control', async () => {
    const user = userEvent.setup();
    let currentToast: ReturnType<typeof toast>;

    render(<Toaster />);

    currentToast = toast({
      forceMount: true,
      title: 'Could not save changes',
      description: 'Check your connection and try again.',
      action: (
        <ToastAction
          altText="Try saving again"
          onClick={() => {
            currentToast.update({
              id: currentToast.id,
              title: 'Changes saved',
              description: 'Your retry completed successfully.',
            });
          }}
        >
          Retry
        </ToastAction>
      ),
    });

    expect(await screen.findByText('Could not save changes')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Changes saved')).toBeTruthy();
    expect(screen.getByText('Your retry completed successfully.')).toBeTruthy();
  });

  it('closes the rendered toast through its close control', async () => {
    const user = userEvent.setup();

    render(<Toaster />);

    toast({
      forceMount: true,
      title: 'Housing request received',
    });

    const title = await screen.findByText('Housing request received');

    await user.click(
      screen.getByRole('button', { name: 'Close notification' }),
    );

    expect(
      title.closest('[data-state]')?.getAttribute('data-state'),
    ).toBe('closed');
  });
});