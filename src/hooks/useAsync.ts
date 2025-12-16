'use client';

import { useState, useCallback, useEffect } from 'react';

interface UseAsyncState<TData> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: TData | null;
  error: Error | null;
}

export const useAsync = <TData,>(
  asyncFunction: () => Promise<TData>,
  immediate = true
) => {
  const [state, setState] = useState<UseAsyncState<TData>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
      return response;
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error as Error,
      });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
  };
};