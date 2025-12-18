import CredoAppService from '@credolab/react-core';

export const CREDO_URL = 'https://scoring-demo.credolab.com';
export const CREDO_UPLOAD_TOKEN =
  '592a1f63031a4937a8379ac6c4aa29a0daaa076442df4eda91ddc117a7a75aca';
export const CREDO_REQUEST_TOKEN =
  'f4cf7dfb16fc447ea32da13e8a2e58085e4f9c4d31e04c33868fae78f9d77023';

export type CredoResp = {ok: boolean; status: number; body: any; url?: string};

export type ScoreDummy = {
  score: number | null;
  probability: number | null;
  calculatedDate: string | null;
} | null;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const tryParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const uploadDataset = async (
  referenceNumber: string,
): Promise<CredoResp> => {
  const service = new CredoAppService();
  const dataset = await service.collectAsync();

  const res = await fetch(`${CREDO_URL}/api/datasets/v1/upload`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CREDO_UPLOAD_TOKEN}`,
    },
    body: JSON.stringify({data: dataset, referenceNumber}),
  });

  const text = await res.text();
  return {ok: res.ok, status: res.status, body: tryParse(text)};
};

export const requestInsights = async (
  referenceNumber: string,
): Promise<CredoResp> => {
  const fullUrl = `${CREDO_URL}/api/insights/v1/${encodeURIComponent(
    referenceNumber,
  )}`;

  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${CREDO_REQUEST_TOKEN}`,
    },
  });

  const text = await res.text();
  return {ok: res.ok, status: res.status, body: tryParse(text), url: fullUrl};
};

export const requestInsightsWithPolling = async (
  referenceNumber: string,
  tries = 8,
  delayMs = 2000,
): Promise<CredoResp | null> => {
  for (let i = 0; i < tries; i++) {
    const r = await requestInsights(referenceNumber);
    if (r.ok) return r;
    await sleep(delayMs);
  }
  return null;
};

export const extractScoreDummyFromInsights = (body: any): ScoreDummy => {
  const insights = body?.insights;
  if (!Array.isArray(insights)) return null;

  const item = insights.find(
    (x: any) =>
      String(x?.code ?? x?.name ?? '').toLowerCase() === 'score_dummy',
  );

  const v = item?.value;
  if (!v) return null;

  const score = Number(v.score);
  const probability = Number(v.probability);

  return {
    score: Number.isFinite(score) ? score : null,
    probability: Number.isFinite(probability) ? probability : null,
    calculatedDate: item?.calculatedDate ?? null,
  };
};
