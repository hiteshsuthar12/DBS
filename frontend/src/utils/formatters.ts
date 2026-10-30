export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (val: number | undefined | null): string => {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'HEALTHY':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'LOW':
    case 'MEDIUM_RISK':
    case 'LOW_RISK':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CRITICAL':
    case 'CRITICAL_STOCK':
    case 'HIGH_RISK':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'OUT_OF_STOCK':
      return 'bg-red-100 text-red-800 border-red-300 font-semibold';
    case 'ACTIVE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ACKNOWLEDGED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

