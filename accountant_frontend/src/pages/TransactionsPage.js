import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { bulkUpdateTransactions, fetchTransactions } from "../api/endpoints";
import { EmptyState, ErrorNotice, LoadingBlock } from "../components/States";

const PAGE_SIZES = [10, 20, 50];

function uniqueCategories(items) {
  const s = new Set(items.map((x) => x.category).filter(Boolean));
  return ["All", ...Array.from(s)];
}

/**
 * PUBLIC_INTERFACE
 * Transactions view: pagination, filters, selection, bulk actions.
 */
export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    category: "All",
    vendor: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ items: [], total: 0 });

  const [selected, setSelected] = useState(() => new Set());
  const [bulkCategory, setBulkCategory] = useState("Meals");
  const [bulkTag, setBulkTag] = useState("review");

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / pageSize)),
    [data.total, pageSize]
  );

  const categories = useMemo(() => uniqueCategories(data.items || []), [data.items]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchTransactions({ page, pageSize, filters });
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load transactions");
    } finally {
      setLoading(false);
      setSelected(new Set());
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  function applyFilters() {
    setPage(1);
    load();
  }

  const allSelected = data.items?.length > 0 && selected.size === data.items.length;

  async function doBulkUpdate(update) {
    const ids = Array.from(selected);
    if (!ids.length) {
      toast.info("Select one or more transactions first.");
      return;
    }
    try {
      const res = await bulkUpdateTransactions({ ids, update });
      toast.success(
        `Bulk updated ${ids.length} transaction(s)${res?.mock ? " (mock)" : ""}`
      );
      await load();
    } catch (e) {
      toast.error(e.message || "Bulk update failed");
    }
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h2 className="cardTitle">Transactions</h2>
          <p className="cardHint">Search, filter, and apply bulk actions.</p>
        </div>
        <div className="row">
          <button className="btn btnSm" onClick={load} disabled={loading}>
            Refresh
          </button>
          <button
            className="btn btnPrimary btnSm"
            onClick={() => toast.info("Export CSV placeholder")}
          >
            Export CSV
          </button>
          <button className="btn btnSm" onClick={() => toast.info("Export PDF placeholder")}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="fieldRow">
        <div>
          <label style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Date from</label>
          <input
            className="input"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Date to</label>
          <input
            className="input"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Amount min</label>
          <input
            className="input"
            type="number"
            placeholder="0"
            value={filters.amountMin}
            onChange={(e) => setFilters((p) => ({ ...p, amountMin: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Amount max</label>
          <input
            className="input"
            type="number"
            placeholder="5000"
            value={filters.amountMax}
            onChange={(e) => setFilters((p) => ({ ...p, amountMax: e.target.value }))}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Category</label>
          <select
            className="select"
            value={filters.category}
            onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Vendor contains</label>
          <input
            className="input"
            placeholder="e.g., Grab"
            value={filters.vendor}
            onChange={(e) => setFilters((p) => ({ ...p, vendor: e.target.value }))}
          />
        </div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn btnPrimary" onClick={applyFilters} disabled={loading}>
            Apply filters
          </button>
          <button
            className="btn"
            onClick={() => {
              setFilters({
                dateFrom: "",
                dateTo: "",
                amountMin: "",
                amountMax: "",
                category: "All",
                vendor: "",
              });
              setPage(1);
              toast.info("Filters cleared");
            }}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="cardBody">
        {error ? <ErrorNotice message={error} onRetry={load} /> : null}
        {loading ? <LoadingBlock lines={5} /> : null}

        {!loading && !error ? (
          <>
            <div className="row spread" style={{ marginBottom: 10 }}>
              <div className="row">
                <span className="pill">
                  <span style={{ fontWeight: 850 }}>Total</span> {data.total || 0}
                </span>
                <span className="pill">
                  <span style={{ fontWeight: 850 }}>Selected</span> {selected.size}
                </span>
                {data.mock ? <span className="badge badgeWarn">Mock data</span> : null}
              </div>

              <div className="row">
                <select
                  className="select"
                  style={{ width: 180 }}
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                >
                  {["Meals", "Office", "Utilities", "Travel", "Software", "Bank Fees"].map((c) => (
                    <option key={c} value={c}>
                      Set category: {c}
                    </option>
                  ))}
                </select>
                <button
                  className="btn btnSm"
                  onClick={() => doBulkUpdate({ category: bulkCategory })}
                >
                  Apply
                </button>

                <input
                  className="input"
                  style={{ width: 160 }}
                  value={bulkTag}
                  onChange={(e) => setBulkTag(e.target.value)}
                  placeholder="tag"
                />
                <button
                  className="btn btnSm"
                  onClick={() => doBulkUpdate({ addTag: bulkTag })}
                >
                  Add tag
                </button>
              </div>
            </div>

            {data.items?.length ? (
              <div className="tableWrap">
                <table className="table" aria-label="Transactions table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelected(new Set(data.items.map((x) => x.id)));
                            } else {
                              setSelected(new Set());
                            }
                          }}
                          aria-label="Select all"
                        />
                      </th>
                      <th>Date</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Tags</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((t) => {
                      const isSel = selected.has(t.id);
                      return (
                        <tr key={t.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={(e) => {
                                setSelected((prev) => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(t.id);
                                  else next.delete(t.id);
                                  return next;
                                });
                              }}
                              aria-label={`Select ${t.id}`}
                            />
                          </td>
                          <td>{t.date}</td>
                          <td style={{ fontWeight: 750 }}>{t.vendor}</td>
                          <td>฿ {Number(t.amount).toLocaleString()}</td>
                          <td>
                            <span className="badge">{t.category || "Uncategorized"}</span>
                          </td>
                          <td style={{ color: "rgba(55,65,81,0.75)" }}>
                            {(t.tags || []).length ? (t.tags || []).join(", ") : "—"}
                          </td>
                          <td>
                            {t.status === "needs_review" ? (
                              <span className="badge badgeWarn">Needs review</span>
                            ) : (
                              <span className="badge badgeSuccess">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No transactions" message="Upload a bank statement to see transactions here." />
            )}

            <div className="row spread" style={{ marginTop: 12 }}>
              <div className="row">
                <button
                  className="btn btnSm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span className="pill">
                  Page <span style={{ fontWeight: 900 }}>{page}</span> / {totalPages}
                </span>
                <button
                  className="btn btnSm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>

              <div className="row">
                <span style={{ fontSize: 12, color: "rgba(55,65,81,0.75)" }}>Rows</span>
                <select
                  className="select"
                  style={{ width: 110 }}
                  value={pageSize}
                  onChange={(e) => {
                    setPage(1);
                    setPageSize(Number(e.target.value));
                  }}
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
