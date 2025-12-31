import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchProfitAndLoss } from "../api/endpoints";
import { ErrorNotice, LoadingBlock } from "../components/States";

/**
 * PUBLIC_INTERFACE
 * Profit & Loss page.
 */
export default function PnLPage() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function load(p = period) {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProfitAndLoss({ period: p });
      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load P&L");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const trend = useMemo(() => data?.trend || [], [data]);

  return (
    <div className="grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h2 className="cardTitle">Profit & Loss</h2>
            <p className="cardHint">A clean snapshot of performance.</p>
          </div>
          <div className="row">
            <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
            <button className="btn btnSm" onClick={() => load(period)} disabled={loading}>
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
          {error ? <ErrorNotice message={error} onRetry={() => load(period)} /> : null}
          {loading ? (
            <LoadingBlock lines={6} />
          ) : data ? (
            <div className="tableWrap">
              <table className="table" aria-label="P&L table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.rows || []).map((r) => (
                    <tr key={r.label}>
                      <td style={{ fontWeight: 750 }}>{r.label}</td>
                      <td>฿ {Number(r.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="notice" style={{ marginTop: 12 }}>
                {data.mock ? (
                  <span className="badge badgeWarn">Mock P&L (backend endpoint TODO)</span>
                ) : (
                  <span className="badge badgeSuccess">Live</span>
                )}
                <span style={{ marginLeft: 10, color: "rgba(55,65,81,0.85)" }}>
                  Export buttons are placeholders for CSV/PDF generation.
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <h2 className="cardTitle">Net Trend</h2>
            <p className="cardHint">Simple trend line.</p>
          </div>
        </div>

        <div className="cardBody">
          {loading ? (
            <LoadingBlock lines={5} />
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="net" stroke="#F472B6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
