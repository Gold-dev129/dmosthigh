/**
 * Format a numeric amount as Nigerian Naira currency string
 * e.g. 100000 -> ₦100,000
 */
export const formatNaira = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₦0';
  }
  const numeric = Math.round(Number(amount));
  return `₦${numeric.toLocaleString('en-NG')}`;
};

/**
 * Format ISO date string into readable format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Standard delivery locations and fees
 */
export const DELIVERY_FEES = {
  Ibadan: 4000,
  'Outside Ibadan': 6000,
};

export const SERVICE_FEE = 1000;

export const getDeliveryFee = (city) => {
  if (!city) return DELIVERY_FEES['Outside Ibadan'];
  const normalized = city.trim().toLowerCase();
  if (normalized === 'ibadan') return DELIVERY_FEES.Ibadan;
  return DELIVERY_FEES['Outside Ibadan'];
};
