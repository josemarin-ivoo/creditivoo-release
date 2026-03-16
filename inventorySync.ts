const CREDITIVOO_SYNC_BASE = 'https://www.creditivoo.com/creditivoo_sync';
const CREDITIVOO_SYNC_ENDPOINT = '/sync_order.php';
const CREDITIVOO_SYNC_TOKEN =
  '5CF+cYnpFGgs3HOGM+UCr0B4mXxIZZN/XFEvysWWPPONu2qv3DU5nY8LE1QKGSQ32N9EHKnEKF';

export type SyncItem = {
  sku: string;
  name?: string;
  qty_ordered: number;
  unit_price?: number;
  currency?: string;
  barcode?: string | null;
};

export type SyncCustomer = {
  external_customer_id?: string | null;
  full_name?: string | null;
  document_number?: string | null;
  document_type?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type SyncAddress = {
  type: 'STORE' | 'PICKUP' | 'DELIVERY' | 'WAREHOUSE' | string;
  code?: string | null;
  name?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type SyncPayload = {
  // core
  order_number: string;
  magento_order_number?: string | null;
  megasoft_invoice_id?: string | null;
  megasoft_control?: string | null;
  source?: string;

  // cashea
  is_cashea?: boolean;
  cashea_invoice_id?: string | null;
  cashea_preorder_id?: string | null;
  cashea_order_id?: string | null;
  cashea_down_payment?: number | null;
  cashea_financed_amount?: number | null;

  // estados
  status?: string;
  status_code?: string;
  state?: string;

  // totales
  currency?: string;
  grand_total?: number;
  payment_fee?: number;

  // logística nueva
  shipping_amount?: number;
  shipping_method?: 'pickup' | 'delivery' | string;
  shipping_service?: 'normal' | 'express' | string | null;
  is_musculito?: boolean;
  shipping_provider_id?: string | null;

  pickup_location_code?: string | null;

  // entidades anidadas nuevas
  customer?: SyncCustomer;
  origin_address?: SyncAddress;
  destination_address?: SyncAddress;

  // items
  items?: SyncItem[];

  // ---- compatibilidad hacia atrás (por si el backend aún lo usa) ----
  customer_email?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;

  magento_order_id?: string | null;
  created_at?: string | null;
  delivery_date?: string | null;
  delivery_time?: string | null;

  // opcional: si quieres mandar el raw también, pero tu DB ya tiene raw_payload
  raw_payload?: any;
};

export type SyncResult =
  | {ok: true; data: any; status: number}
  | {ok: false; error: string; status: number; data?: any};

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Normaliza el payload para:
 * - Garantizar defaults
 * - Incluir fields legacy (customer_email, etc.) cuando el payload venga anidado
 * Así si el PHP está “a medio migrar”, no se rompe.
 */
function normalizeSyncPayload(payload: SyncPayload): SyncPayload {
  const p: SyncPayload = {...payload};

  // defaults mínimos
  p.source = p.source ?? 'ivoo_app';
  p.status = p.status ?? 'processing';
  p.status_code = p.status_code ?? p.status ?? 'processing';
  p.state = p.state ?? 'new';
  p.currency = p.currency ?? 'USD';
  p.magento_order_number = p.magento_order_number ?? null;
  p.megasoft_invoice_id = p.megasoft_invoice_id ?? null;
  p.megasoft_control = p.megasoft_control ?? null;

  // si viene customer anidado, llena legacy fields por compatibilidad
  if (p.customer) {
    p.customer_email = p.customer_email ?? p.customer.email ?? null;
    p.customer_name = p.customer_name ?? p.customer.full_name ?? null;
    p.customer_phone = p.customer_phone ?? p.customer.phone ?? null;
  }

  // si viene origin/destination, asegura lat/lng number
  if (p.origin_address) {
    p.origin_address.lat =
      p.origin_address.lat != null ? Number(p.origin_address.lat) : null;
    p.origin_address.lng =
      p.origin_address.lng != null ? Number(p.origin_address.lng) : null;
  }

  if (p.destination_address) {
    p.destination_address.lat =
      p.destination_address.lat != null
        ? Number(p.destination_address.lat)
        : null;
    p.destination_address.lng =
      p.destination_address.lng != null
        ? Number(p.destination_address.lng)
        : null;
  }

  // boolean seguro
  if (typeof p.is_musculito !== 'boolean') {
    p.is_musculito = !!p.is_musculito;
  }

  // numbers seguros
  if (p.grand_total != null) p.grand_total = Number(p.grand_total);
  if (p.payment_fee != null) p.payment_fee = Number(p.payment_fee);
  if (p.shipping_amount != null) p.shipping_amount = Number(p.shipping_amount);

  // ---- Cashea hygiene ----
  p.is_cashea = typeof p.is_cashea === 'boolean' ? p.is_cashea : !!p.is_cashea;

  // si NO es cashea, nullear todo para evitar “estado pegado”
  if (!p.is_cashea) {
    p.cashea_invoice_id = null;
    p.cashea_preorder_id = null;
    p.cashea_order_id = null;
    p.cashea_down_payment = null;
    p.cashea_financed_amount = null;
  } else {
    // si SÍ es cashea, numbers seguros
    if (p.cashea_down_payment != null)
      p.cashea_down_payment = Number(p.cashea_down_payment);
    if (p.cashea_financed_amount != null)
      p.cashea_financed_amount = Number(p.cashea_financed_amount);
  }

  return p;
}

export async function syncOrderToCreditivoo(
  payload: SyncPayload,
  opts?: {timeoutMs?: number},
): Promise<SyncResult> {
  const url = `${CREDITIVOO_SYNC_BASE}${CREDITIVOO_SYNC_ENDPOINT}`;

  const controller = new AbortController();
  const timeoutMs = opts?.timeoutMs ?? 12000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const normalized = normalizeSyncPayload(payload);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Token': CREDITIVOO_SYNC_TOKEN,
      },
      body: JSON.stringify(normalized),
      signal: controller.signal,
    });

    const text = await res.text();
    const data = safeJsonParse(text);

    if (!res.ok) {
      const errMsg =
        typeof data === 'string' ? data : JSON.stringify(data ?? {});
      return {
        ok: false,
        status: res.status,
        error: `Sync failed (${res.status}): ${errMsg}`,
        data,
      };
    }

    return {ok: true, status: res.status, data};
  } catch (e: any) {
    const msg =
      e?.name === 'AbortError'
        ? `Sync timeout (${timeoutMs}ms)`
        : e?.message ?? String(e);

    return {ok: false, status: 0, error: msg};
  } finally {
    clearTimeout(timeout);
  }
}
