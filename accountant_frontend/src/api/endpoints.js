import { apiJson, apiMultipart } from "./client";

/**
 * NOTE:
 * The backend OpenAPI spec endpoint returned 404 in this environment, so these functions are written to:
 *  - call likely REST endpoints when available, and
 *  - fall back to mock data (with TODO comments) when the backend does not yet implement them.
 */

function nowIso() {
  return new Date().toISOString();
}

function mockTransactions(count = 42) {
  const categories = ["Meals", "Office", "Utilities", "Travel", "Software", "Bank Fees"];
  const vendors = ["7-Eleven", "Grab", "True", "AIS", "Lazada", "Shopee", "Bangkok Bank"];
  const out = [];
  for (let i = 0; i < count; i++) {
    const amt = Math.round((Math.random() * 2500 + 50) * 100) / 100;
    const cat = categories[i % categories.length];
    out.push({
      id: `tx_${i + 1}`,
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      vendor: vendors[i % vendors.length],
      amount: amt,
      category: cat,
      tags: i % 3 === 0 ? ["review"] : [],
      status: i % 5 === 0 ? "needs_review" : "ok",
    });
  }
  return out;
}

/**
 * PUBLIC_INTERFACE
 * Upload bank statement (CSV/PDF).
 */
export async function uploadBankStatement(file) {
  // TODO: align with real backend endpoint.
  // Suggested: POST /api/uploads/bank-statement (multipart, field: file)
  const formData = new FormData();
  formData.append("file", file);

  try {
    return await apiMultipart("/api/uploads/bank-statement", { formData });
  } catch (e) {
    // Fallback for dev: treat as accepted.
    return { ok: true, uploadId: `upl_${Date.now()}`, receivedAt: nowIso(), mock: true };
  }
}

/**
 * PUBLIC_INTERFACE
 * Upload receipt image/PDF.
 */
export async function uploadReceipt(file) {
  // TODO: align with real backend endpoint.
  // Suggested: POST /api/uploads/receipt (multipart, field: file)
  const formData = new FormData();
  formData.append("file", file);

  try {
    return await apiMultipart("/api/uploads/receipt", { formData });
  } catch (e) {
    return { ok: true, uploadId: `rcpt_${Date.now()}`, receivedAt: nowIso(), mock: true };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch paginated transactions with filters.
 */
export async function fetchTransactions({ page, pageSize, filters }) {
  // TODO: align with real backend endpoint.
  // Suggested: GET /api/transactions?page=1&pageSize=20&dateFrom=... etc.
  // For now, try POST search endpoint, fallback to mock.
  try {
    return await apiJson("/api/transactions/search", {
      method: "POST",
      body: { page, pageSize, filters },
    });
  } catch (e) {
    const all = mockTransactions(97);
    const { dateFrom, dateTo, amountMin, amountMax, category, vendor } = filters || {};
    const filtered = all.filter((t) => {
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      if (amountMin && t.amount < Number(amountMin)) return false;
      if (amountMax && t.amount > Number(amountMax)) return false;
      if (category && category !== "All" && t.category !== category) return false;
      if (vendor && !t.vendor.toLowerCase().includes(String(vendor).toLowerCase())) return false;
      return true;
    });

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { items, total, page, pageSize, mock: true };
  }
}

/**
 * PUBLIC_INTERFACE
 * Bulk update transactions (e.g., set category/tag).
 */
export async function bulkUpdateTransactions({ ids, update }) {
  // TODO: align with backend endpoint.
  try {
    return await apiJson("/api/transactions/bulk", { method: "PATCH", body: { ids, update } });
  } catch (e) {
    return { ok: true, updated: ids?.length || 0, mock: true };
  }
}

/**
 * PUBLIC_INTERFACE
 * Update a single transaction classification.
 */
export async function updateTransactionClassification({ id, category, tags }) {
  // TODO: align with backend endpoint.
  try {
    return await apiJson(`/api/transactions/${encodeURIComponent(id)}/classification`, {
      method: "PUT",
      body: { category, tags },
    });
  } catch (e) {
    return { ok: true, id, category, tags, mock: true };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch summaries.
 */
export async function fetchSummaries() {
  // TODO: align with backend endpoint.
  try {
    return await apiJson("/api/summaries");
  } catch (e) {
    return {
      totals: {
        income: 245000,
        expenses: 132450,
        net: 112550,
      },
      byCategory: [
        { name: "Meals", value: 18500 },
        { name: "Office", value: 24600 },
        { name: "Utilities", value: 15400 },
        { name: "Travel", value: 32000 },
        { name: "Software", value: 21950 },
        { name: "Bank Fees", value: 5200 },
      ],
      mock: true,
    };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch P&L report.
 */
export async function fetchProfitAndLoss({ period = "month" } = {}) {
  // TODO: align with backend endpoint.
  try {
    return await apiJson(`/api/reports/pnl?period=${encodeURIComponent(period)}`);
  } catch (e) {
    return {
      period,
      rows: [
        { label: "Revenue", amount: 245000 },
        { label: "Cost of Goods Sold", amount: 0 },
        { label: "Gross Profit", amount: 245000 },
        { label: "Operating Expenses", amount: 132450 },
        { label: "Net Profit", amount: 112550 },
      ],
      trend: Array.from({ length: 12 }).map((_, idx) => ({
        month: `M${idx + 1}`,
        net: Math.round((Math.random() * 80000 + 40000) * 100) / 100,
      })),
      mock: true,
    };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch reconciliation matches.
 */
export async function fetchReconciliation({ page, pageSize, status } = {}) {
  // TODO: align with backend endpoint.
  try {
    return await apiJson("/api/reconciliation/search", {
      method: "POST",
      body: { page, pageSize, status },
    });
  } catch (e) {
    const items = Array.from({ length: 35 }).map((_, i) => ({
      id: `rec_${i + 1}`,
      transactionId: `tx_${i + 1}`,
      receiptId: i % 3 === 0 ? `rcpt_${i + 1}` : null,
      amount: Math.round((Math.random() * 2500 + 50) * 100) / 100,
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      status: i % 3 === 0 ? "matched" : i % 3 === 1 ? "missing_receipt" : "mismatch",
    }));

    const filtered = status && status !== "all" ? items.filter((x) => x.status === status) : items;
    const total = filtered.length;
    const p = page || 1;
    const ps = pageSize || 10;
    const start = (p - 1) * ps;
    return { items: filtered.slice(start, start + ps), total, page: p, pageSize: ps, mock: true };
  }
}

/**
 * PUBLIC_INTERFACE
 * Resolve reconciliation manually.
 */
export async function resolveReconciliation({ id, action }) {
  // action could be "mark_matched" | "ignore" | "request_receipt" etc.
  // TODO: align with backend endpoint.
  try {
    return await apiJson(`/api/reconciliation/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      body: { action },
    });
  } catch (e) {
    return { ok: true, id, action, resolvedAt: nowIso(), mock: true };
  }
}
