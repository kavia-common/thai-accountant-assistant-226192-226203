import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { fetchTransactions, updateTransactionClassification } from "../api/endpoints";
import { EmptyState, ErrorNotice, LoadingBlock } from "../components/States";

/**
 * PUBLIC_INTERFACE
 * Classification page: inline edit category/tags and save/cancel.
 */
export default function ClassificationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [draftCategory, setDraftCategory] = useState("");
  const [draftTags, setDraftTags] = useState("");

  const categories = useMemo(
    () => ["Meals", "Office", "Utilities", "Travel", "Software", "Bank Fees", "Other"],
    []
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      // We pull a single page for review; backend can later provide a dedicated "needs_review" endpoint.
      const res = await fetchTransactions({
        page: 1,
        pageSize: 50,
        filters: { category: "All", vendor: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "" },
      });

      const needsReview = (res.items || []).map((t) => ({
        ...t,
        status: t.status || ((t.tags || []).includes("review") ? "needs_review" : "ok"),
      }));

      setItems(needsReview);
    } catch (e) {
      setError(e.message || "Failed to load classification queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(t) {
    setEditingId(t.id);
    setDraftCategory(t.category || "Other");
    setDraftTags((t.tags || []).join(", "));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftCategory("");
    setDraftTags("");
  }

  async function saveEdit(id) {
    const tags = draftTags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      const res = await updateTransactionClassification({ id, category: draftCategory, tags });
      toast.success(`Saved classification${res?.mock ? " (mock)" : ""}`);
      setItems((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, category: draftCategory, tags, status: "ok" } : t
        )
      );
      cancelEdit();
    } catch (e) {
      toast.error(e.message || "Failed to save");
    }
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h2 className="cardTitle">Classification Review</h2>
          <p className="cardHint">Override category and tags with inline editing.</p>
        </div>
        <div className="row">
          <button className="btn btnSm" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <div className="cardBody">
        {error ? <ErrorNotice message={error} onRetry={load} /> : null}
        {loading ? <LoadingBlock lines={5} /> : null}

        {!loading && !error ? (
          items.length ? (
            <div className="tableWrap">
              <table className="table" aria-label="Classification table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Tags</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => {
                    const isEditing = editingId === t.id;
                    return (
                      <tr key={t.id}>
                        <td>{t.date}</td>
                        <td style={{ fontWeight: 750 }}>{t.vendor}</td>
                        <td>฿ {Number(t.amount).toLocaleString()}</td>

                        <td>
                          {isEditing ? (
                            <select
                              className="select"
                              value={draftCategory}
                              onChange={(e) => setDraftCategory(e.target.value)}
                            >
                              {categories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge">{t.category || "Other"}</span>
                          )}
                        </td>

                        <td style={{ minWidth: 260 }}>
                          {isEditing ? (
                            <input
                              className="input"
                              value={draftTags}
                              onChange={(e) => setDraftTags(e.target.value)}
                              placeholder="comma separated"
                            />
                          ) : (
                            <span style={{ color: "rgba(55,65,81,0.75)" }}>
                              {(t.tags || []).length ? (t.tags || []).join(", ") : "—"}
                            </span>
                          )}
                        </td>

                        <td>
                          {t.status === "needs_review" ? (
                            <span className="badge badgeWarn">Needs review</span>
                          ) : (
                            <span className="badge badgeSuccess">OK</span>
                          )}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          {isEditing ? (
                            <div className="row" style={{ justifyContent: "flex-end" }}>
                              <button className="btn btnPrimary btnSm" onClick={() => saveEdit(t.id)}>
                                Save
                              </button>
                              <button className="btn btnSm" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button className="btn btnSm" onClick={() => startEdit(t)}>
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Nothing to review" message="All transactions appear classified." />
          )
        ) : null}
      </div>
    </div>
  );
}
