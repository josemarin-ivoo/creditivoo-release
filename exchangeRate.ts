const EXCHANGE_API = 'https://creditivoo.com/creditivoo_sync/latest';

export type ExchangeLatest = {
  id: number;
  amount: number;
  fetchedAt: string;
  fetchedAtVe: string;
};

export async function getLatestBcvRate(): Promise<ExchangeLatest> {
  const res = await fetch(EXCHANGE_API, {
    method: 'GET',
    headers: {Accept: 'application/json'},
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`BCV rate error: ${res.status} ${txt}`);
  }

  const json = await res.json();
  const data = Array.isArray(json) ? json[0] : json;

  return {
    id: Number(data.id),
    amount: Number(data.amount),
    fetchedAt: String(data.fetchedAt),
    fetchedAtVe: String(data.fetchedAtVe),
  };
}

export function usdToVes(usd: number, rate: number): number {
  if (!usd || usd <= 0) return 0;
  if (!rate || rate <= 0) return 0;
  // Redondeo a 2 decimales
  return Math.round(usd * rate * 100) / 100;
}
