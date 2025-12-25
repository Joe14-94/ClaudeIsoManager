import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConfirm } from '../../hooks/useConfirm';

describe('useConfirm', () => {
  it('devrait initialiser avec un état fermé', () => {
    const { result } = renderHook(() => useConfirm());

    expect(result.current.confirmState.isOpen).toBe(false);
    expect(result.current.confirmState.title).toBe('');
    expect(result.current.confirmState.message).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('devrait ouvrir la modal avec les bonnes options', async () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm({
        title: 'Confirmation',
        message: 'Êtes-vous sûr ?',
        variant: 'danger',
      });
    });

    expect(result.current.confirmState.isOpen).toBe(true);
    expect(result.current.confirmState.title).toBe('Confirmation');
    expect(result.current.confirmState.message).toBe('Êtes-vous sûr ?');
    expect(result.current.confirmState.variant).toBe('danger');
  });

  it('devrait résoudre true sur confirmation', async () => {
    const { result } = renderHook(() => useConfirm());

    let resolvedValue: boolean | null = null;

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Message',
      }).then((value) => {
        resolvedValue = value;
      });
    });

    act(() => {
      result.current.handleConfirm();
    });

    expect(resolvedValue).toBe(true);
    expect(result.current.confirmState.isOpen).toBe(false);
  });

  it('devrait résoudre false sur annulation', async () => {
    const { result } = renderHook(() => useConfirm());

    let resolvedValue: boolean | null = null;

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Message',
      }).then((value) => {
        resolvedValue = value;
      });
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(resolvedValue).toBe(false);
    expect(result.current.confirmState.isOpen).toBe(false);
  });

  it('devrait utiliser les valeurs par défaut pour confirmText et cancelText', async () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Message',
      });
    });

    expect(result.current.confirmState.confirmText).toBe('Confirmer');
    expect(result.current.confirmState.cancelText).toBe('Annuler');
  });

  it('devrait permettre de personnaliser confirmText et cancelText', async () => {
    const { result } = renderHook(() => useConfirm());

    act(() => {
      result.current.confirm({
        title: 'Test',
        message: 'Message',
        confirmText: 'Oui',
        cancelText: 'Non',
      });
    });

    expect(result.current.confirmState.confirmText).toBe('Oui');
    expect(result.current.confirmState.cancelText).toBe('Non');
  });

  it('devrait gérer l\'état de chargement', async () => {
    const { result } = renderHook(() => useConfirm());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setIsLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
