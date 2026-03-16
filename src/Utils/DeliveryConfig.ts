export const DELIVERY_CONFIG: any = {
  ivoo_moto: { active: true, profit: 2.0, max_dist: 20 },
  yummy_moto: { active: true, profit: 0.5, max_dist: 20 },
  yummy_carro: { active: true, profit: 2.0, max_dist: 20 },
  flety_van: { active: true, profit: 5.0, max_dist: 80 },
  flety_camion: { active: true, profit: 5.0, max_dist: 80 },
  ivoo_programado: { active: true, profit: 0.0, max_dist: 40 },
};

export const fetchDeliveryConfig = async (storeId: string) => {
  try {
    // Añadimos timestamp para evitar cache del navegador/celular
    const response = await fetch(`https://deliveryqa.ivoofix.com/api/public/delivery-status?storeId=${storeId}&t=${Date.now()}`);
    const json = await response.json();

    // IMPORTANTE: Si la API devuelve un array, lo convertimos a objeto indexado por provider_id
    if (json && typeof json === 'object') {
      // Si la API ya viene como objeto con las llaves (ivoo_moto, etc.), lo devolvemos directo
      if (json.ivoo_moto) return json;

      // Si viene como una lista de objetos, la transformamos
      const formattedConfig: any = {};
      Object.keys(json).forEach((key) => {
        const item = json[key];
        formattedConfig[key] = {
          active: Boolean(item.active),
          profit: parseFloat(item.profit || 0),
          max_dist: parseFloat(item.max_dist || 20),
          limit_base: parseFloat(item.limit_base || 10),
          km_extra: parseFloat(item.km_extra || 0.30),
          extra_config: item.extra_config || "",
          is_free: Boolean(item.is_free),
          free_rule: item.free_rule || 'all',
          free_until: item.free_until,
          free_from: item.free_from,
          free_to: item.free_to
        };
      });
      return formattedConfig;
    }
    return DELIVERY_CONFIG;
  } catch (error) {
    console.error("Error fetching delivery config:", error);
    return DELIVERY_CONFIG;
  }
};

export const getProviderProfit = (providerId: string | null, activeConfig: any) => {
  if (!providerId || !activeConfig) return 0;
  
  // Buscamos el profit en la configuración dinámica que viene del servidor
  const config = activeConfig[providerId];
  return config ? parseFloat(config.profit || 0) : 0;
};

/**
 * Función Maestra de Cálculo de Costo
 * Centraliza la lógica para que la tarjeta y el checkout siempre digan lo mismo
 */
export const calculateProviderCost = (providerId: string, dist: number, yummyBase: number, activeConfig: any) => {
  const settings = activeConfig ? activeConfig[providerId] : DELIVERY_CONFIG[providerId];
  if (!settings) return 0;

  // 1. REGLA DE ENVÍO GRATIS
  if (settings.is_free) {
    if (settings.free_rule === 'all') return 0;
    if (settings.free_rule === 'until' && dist <= (settings.free_until || 0)) return 0;
    if (settings.free_rule === 'range' && dist >= (settings.free_from || 0) && dist <= (settings.free_to || 0)) return 0;
  }

  const profit = parseFloat(settings.profit || 0);

  // 2. LÓGICA POR PROVEEDOR
  if (providerId === 'ivoo_moto') {
    const limitBase = settings.limit_base || 10;
    const kmExtraPrice = settings.km_extra || 0.30;
    return dist <= limitBase ? profit : profit + ((dist - limitBase) * kmExtraPrice);
  }

  if (providerId.includes('yummy')) {
    return yummyBase + profit;
  }

  if (providerId.includes('flety') || providerId === 'ivoo_programado') {
    if (settings.extra_config) {
      try {
        const scales = settings.extra_config.split(',').map((s: any) => {
          const [start, end, val] = s.split(':');
          return { start: parseFloat(start), end: parseFloat(end), val: parseFloat(val) };
        });
        const match = scales.find((s: any) => dist >= s.start && dist <= s.end);
        return (match ? match.val : scales[scales.length - 1].val) + profit;
      } catch (e) { return 65 + profit; }
    }
  }

  return profit;
};
