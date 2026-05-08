// Generate readable filename
export const generateFileName = (baseName, options = {}) => {
  const sanitize = (name) => name.replace(/[^a-zA-Z0-9-_]/g, "_");

  const safeBase = sanitize(baseName);
  const extension = options.extension || "xlsx";

  const now = new Date();

  const formatDate = (date) =>
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const formatTime = (date) =>
    String(date.getHours()).padStart(2, "0") +
    "-" +
    String(date.getMinutes()).padStart(2, "0") +
    "-" +
    String(date.getSeconds()).padStart(2, "0");

  if (options.dateFrom && options.dateTo) {
    return (
      safeBase +
      "_" +
      options.dateFrom +
      "_to_" +
      options.dateTo +
      "." +
      extension
    );
  }

  return (
    safeBase + "_" + formatDate(now) + "_" + formatTime(now) + "." + extension
  );
};

export const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};

export function cleanCurrency(value) {
  if (value === null || value === undefined) return "0.00";

  // Convert to string safely
  const str = String(value);

  // Remove $ and any extra spaces
  const cleaned = str.replace(/\$/g, "").trim();

  return cleaned;
}

/**
 * COST PLUS MODEL (Markup Reduced By Discount)
 *
 * LOGIC:
 * 1. Effective Markup = Markup% - Discount%
 * 2. Price Before GST = CP × (1 + Effective Markup%)
 * 3. GST is added (exclusive model)
 *
 * NOTE:
 * Discount reduces PROFIT MARGIN, not selling price directly.
 */

export const getPharmaSellingFromCP = (item, qty, discountPercent) => {
  const cp = Number(item?.CP) || 0;
  const cgstPercent = Number(item?.CGST) || 0;
  const sgstPercent = Number(item?.SGST) || 0;

  const totalGstPercent = cgstPercent + sgstPercent;
  const markupPercent = 10; // constant markup

  if (discountPercent > markupPercent) {
    throw new Error("Discount cannot exceed markup percent");
  }

  const to2 = (n) => Number(n.toFixed(2));

  // STEP 1: Base cost
  const baseCost = cp * qty;

  // STEP 2: Markup amount (10%)
  const markupAmount = (baseCost * markupPercent) / 100;

  // STEP 3: Discount amount (reducing markup)
  const discountAmount = (baseCost * discountPercent) / 100;

  // STEP 4: Effective markup
  const effectiveMarkupAmount = markupAmount - discountAmount;

  // STEP 5: Selling price before GST
  const priceBeforeGST = baseCost + effectiveMarkupAmount;

  // STEP 6: GST
  const totalGstAmount = (priceBeforeGST * totalGstPercent) / 100;

  const cgstAmount = totalGstAmount / 2;
  const sgstAmount = totalGstAmount / 2;

  // STEP 7: Final
  const finalPrice = priceBeforeGST + totalGstAmount;

  return {
    qty,
    baseCost: to2(baseCost),
    markupPercent,
    markupAmount: to2(markupAmount),

    discountPercent,
    discountAmount: to2(discountAmount),

    effectiveMarkupAmount: to2(effectiveMarkupAmount),
    priceBeforeGST: to2(priceBeforeGST),

    cgstAmount: to2(cgstAmount),
    sgstAmount: to2(sgstAmount),

    total: to2(finalPrice),
  };
};

export const parseCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value).replace(/[^0-9.-]+/g, "");

  const parsed = Number(cleaned);

  return isNaN(parsed) ? 0 : parsed;
};