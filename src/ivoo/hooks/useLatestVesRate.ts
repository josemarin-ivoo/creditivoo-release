import {useState, useEffect, useCallback} from 'react';
import {getLatestVesRate, ExchangeRate} from '../services/exchangeRate';

interface UseLatestVesRateReturn {
  rate: ExchangeRate | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personalizado para obtener y manejar la última tasa de cambio en VES.
 * Obtiene automáticamente la tasa cuando se monta el componente.
 *
 * @param autoFetch - Si es true, obtiene la tasa automáticamente al montar (default: true)
 * @returns Objeto con rate, loading, error y función refetch
 */
export function useLatestVesRate(
  autoFetch: boolean = true,
): UseLatestVesRateReturn {
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const latestRate = await getLatestVesRate();
      setRate(latestRate);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener la tasa de cambio';
      setError(errorMessage);
      setRate(null);
      console.error('[useLatestVesRate] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchRate();
    }
  }, [autoFetch, fetchRate]);

  return {rate, loading, error, refetch: fetchRate};
}
