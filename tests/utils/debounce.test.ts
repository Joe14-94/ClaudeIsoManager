import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from '../../utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait retarder l\'exécution de la fonction', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith('arg1');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('devrait annuler les appels précédents', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1');
    vi.advanceTimersByTime(50);
    debouncedFn('arg2');
    vi.advanceTimersByTime(50);
    debouncedFn('arg3');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg3');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('devrait permettre d\'annuler manuellement', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1');
    debouncedFn.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devrait exécuter immédiatement le premier appel', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1');
    expect(fn).toHaveBeenCalledWith('arg1');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('devrait ignorer les appels pendant l\'intervalle', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1');
    throttledFn('arg2');
    throttledFn('arg3');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg1');
  });

  it('devrait exécuter le dernier appel après l\'intervalle', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1');
    throttledFn('arg2');
    throttledFn('arg3');

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('arg3');
  });
});
