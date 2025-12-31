import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { fetchReconciliation, resolveReconciliation } from "../api/endpoints";
import { EmptyState, ErrorNotice, LoadingBlock } from "../components/States";

/**
 * PUBLIC_INTERFACE
 * Reconciliation page.
 */
export default function ReconciliationPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ items: [], total: 0 });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / pageSize)),
    [data.total, pageSize]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchReconciliation({ page, pageSize, status });
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load reconciliation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  async function resolve(id, action) {
    try {
      const res = await resolveReconciliation({ id, action });
      toast.success(`Resolved ${id}${res?.mock ? " (mock)" : ""}`);
      await load();
    } catch (e) {
      toast.error(e.message || "Resolve failed");
    }
  }

  function statusBadge(s) {
    if (s === "matched") return <span className="badge badgeSuccess">Matched</span>;
    if (s === "missing_receipt") return <span className="badge badgeWarn">Missing receipt</span>;
    if (s === "mismatch") return <span className="badge badgeError">Mismatch</span>;
    return <span className="badge">Unknown</span>;
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h2 className="cardTitle">Reconciliation</h2>
          <p className="cardHint">Compare transactions vs receipts and resolve mismatches.</p>
        </div>
        <div className="row">
          <select className="select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
            <option value="all">All</option>
            <option value="matched">Matched</option>
            <option value="missing_receipt">Missing receipt</option>
            <option value="mismatch">Mismatch</option>
          </select>
          <button className="btn btnSm" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="cardBody">
        {error ? <ErrorNotice message={error} onRetry={load} /> : null}
        {loading ? <LoadingBlock lines={6} /> : null}

        {!loading && !error ? (
          data.items?.length ? (
            <>
              {data.mock ? (
                <div className="notice" style={{ marginBottom: 12 }}>
                  <span className="badge badgeWarn">Mock reconciliation (backend endpoint TODO)</span>
                  <span style={{ marginLeft: 10, color: "rgba(55,65,81,0.85)" }}>
                    Manual resolve actions are wired and will call the backend when available.
                  </span>
                </div>
              ) : null}

              <div className="tableWrap">
                <table className="table" aria-label="Reconciliation table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Transaction</th>
                      <th>Receipt</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 800 }}>{r.id}</td>
                        <td>{r.date}</td>
                        <td>฿ {Number(r.amount).toLocaleString()}</td>
                        <td>{r.transactionId}</td>
                        <td>{r.receiptId || "—"}</td>
                        <td>{statusBadge(r.status)}</td>
                        <td style={{ textAlign: "right" }}>
                          <div className="row" style={{ justifyContent: "flex-end" }}>
                            {r.status !== "matched" ? (
                              <button className="btn btnPrimary btnSm" onClick={() => resolve(r.id, "mark_matched")}>
                                Mark matched
                              </button>
                            ) : null}
                            {r.status === "missing_receipt" ? (
                              <button className="btn btnSm" onClick={() => resolve(r.id, "request_receipt")}>
                                Request receipt
                              </button>
                            ) : null}
                            <button className="btn btnDanger btnSm" onClick={() => resolve(r.id, "ignore")}>
                              Ignore
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="row spread" style={{ marginTop: 12 }}>
                <div className="row">
                  <button className="btn btnSm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
                  <select className="select" style={{ width: 110 }} value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}>
                    {[10, 20, 50].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="No reconciliation items" message="Upload receipts and statements to begin matching." />
          )
        ) : null}
      </div>
    </div>
  );
}
