export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const cellInputClass =
  'w-full min-w-[80px] rounded-md border border-slate-200 px-2 py-1.5 text-right text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500';

export const stickyLabelClass =
  'sticky left-0 z-10 bg-white px-3 py-2 font-medium text-slate-800 whitespace-nowrap';

export const stickyHeaderClass =
  'sticky left-0 z-10 bg-sky-50 px-3 py-2 text-left font-semibold';
