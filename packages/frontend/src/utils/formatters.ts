export const formatUSDT = (amount: number): string => {
  if (isNaN(amount)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPrice = (price: number): string => {
  if (isNaN(price)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatBTC = (amount: number): string => {
  if (isNaN(amount)) return '0.0000000';
  return parseFloat(amount.toFixed(7)).toString();
};

export const generateUniqueOrderId = (): string => {
  return (
    'ORD-' +
    Math.floor(100000 + Math.random() * 900000) +
    '-' +
    new Date().getTime().toString().slice(-4)
  );
};
