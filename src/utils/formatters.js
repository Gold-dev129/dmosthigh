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
  Ibadan: 6000,
  Lagos: 7000,
  Abuja: 8500,
};

export const SERVICE_FEE = 1000;

export const getDeliveryFee = (city) => {
  if (!city) return DELIVERY_FEES.Lagos;
  const match = Object.keys(DELIVERY_FEES).find(
    (c) => c.toLowerCase() === city.trim().toLowerCase()
  );
  return match ? DELIVERY_FEES[match] : DELIVERY_FEES.Lagos;
};
