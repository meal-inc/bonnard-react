import { useState, useEffect, useCallback, useRef } from 'react';
import type { QueryOptions, QueryResult } from '@bonnard/sdk';
import { useBonnard } from '../context';

export interface UseBonnardQueryOptions {
  query: QueryOptions;
  skip?: boolean;
}

export interface UseBonnardQueryResult<T = Record<string, unknown>> {
  data: T[] | undefined;
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

export function useBonnardQuery<T = Record<string, unknown>>(
  options: UseBonnardQueryOptions,
): UseBonnardQueryResult<T> {
  const { client } = useBonnard();
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | undefined>(undefined);
  const serialized = JSON.stringify(options.query);
  const versionRef = useRef(0);

  const execute = useCallback(async () => {
    versionRef.current += 1;
    const version = versionRef.current;
    setLoading(true);
    setError(undefined);
    try {
      const result: QueryResult<T> = await client.query<T>(options.query);
      if (version === versionRef.current) {
        setData(result.data);
        setLoading(false);
      }
    } catch (err) {
      if (version === versionRef.current) {
        setError(err instanceof Error ? err.message : 'Query failed');
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, serialized]);

  useEffect(() => {
    if (options.skip) {
      setLoading(false);
      return;
    }
    execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, options.skip]);

  return { data, loading, error, refetch: execute };
}
