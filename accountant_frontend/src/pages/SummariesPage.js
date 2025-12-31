import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fetchSummaries } from "../api/endpoints";
import { ErrorNotice, LoadingBlock } from "../components/States";

/**
 * PUBLIC_INTERFACE
 * Summaries page: KPIs + category breakdown chart/table.
 */
export default function SummariesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const pieData = useMemo(() => data?.byCategory || [], [data]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchSummaries();
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load summaries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = data?.totals || { income: 0, expenses: 0, net: 0 };

  return (
    <div className="grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h2 className="cardTitle">KPIs</h2>
            <p className="cardHint">High-level view of your period.</p>
          </div>
          <div className="row">
            <button className="btn btnSm" onClick={load} disabled={loading}>
              Refresh
            </button>
            <button className="btn btnPrimary btnSm" onClick={() => toast.info("Export CSV placeholder")}>
              Export CSV
            </button>
            <button className="btn btnSm" onClick={() => toast.info("Export PDF placeholder")}>
              Export PDF
            </button>
          </div>
        </div>

        <div className="cardBody">
          {error ? <ErrorNotice message={error} onRetry={load} /> : null}
          {loading ? (
            <LoadingBlock lines={6} />
          ) : data ? (
            <>
              <div className="grid3">
                <div className="kpi">
                  <div className="kpiLabel">Income</div>
                  <div className="kpiValue">฿ {Number(totals.income).toLocaleString()}</div>
                  <div className="kpiDelta">+ stable</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Expenses</div>
                  <div className="kpiValue">฿ {Number(totals.expenses).toLocaleString()}</div>
                  <div className="kpiDelta">review categories</div>
                </div>
                <div className="kpi">
                  <div className="kpiLabel">Net</div>
                  <div className="kpiValue">฿ {Number(totals.net).toLocaleString()}</div>
                  <div className="kpiDelta">healthy</div>
                </div>
              </div>

              <div className="notice" style={{ marginTop: 12 }}>
                {data.mock ? (
                  <span className="badge badgeWarn">Mock summaries (backend endpoint TODO)</span>
                ) : (
                  <span className="badge badgeSuccess">Live</span>
                )}
                <span style={{ marginLeft: 10, color: "rgba(55,65,81,0.85)" }}>
                  Tip: Use Classification to refine category breakdown.
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <h2 className="cardTitle">By Category</h2>
            <p className="cardHint">Where expenses concentrate.</p>
          </div>
        </div>

        <div className="cardBody">
          {loading ? (
            <LoadingBlock lines={5} />
          ) : data ? (
            <>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Tooltip />
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} fill="#F472B6" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="tableWrap" style={{ marginTop: 10 }}>
                <table className="table" aria-label="Category summary table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieData.map((row) => (
                      <tr key={row.name}>
                        <td style={{ fontWeight: 750 }}>{row.name}</td>
                        <td>฿ {Number(row.value).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="emptyState">No data yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
