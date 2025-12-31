import React from "react";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Home page: quick overview and CTA.
 */
export default function HomePage() {
  return (
    <div className="grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <h2 className="cardTitle">Welcome</h2>
            <p className="cardHint">A calm, elegant workflow for Thai accounting tasks.</p>
          </div>
        </div>
        <div className="cardBody">
          <div className="notice">
            Upload bank statements and receipts, review classifications, then generate summaries and P&L and reconcile.
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link to="/uploads" className="btn btnPrimary" style={{ textDecoration: "none" }}>
              Start with Uploads
            </Link>
            <Link to="/transactions" className="btn" style={{ textDecoration: "none" }}>
              View Transactions
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <h2 className="cardTitle">What’s included</h2>
            <p className="cardHint">UI is wired to backend calls with fallbacks until endpoints exist.</p>
          </div>
        </div>
        <div className="cardBody">
          <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(55,65,81,0.85)", lineHeight: 1.7 }}>
            <li>Uploads (drag & drop, file list, progress, error states)</li>
            <li>Transactions (filters, pagination, selection, bulk actions)</li>
            <li>Classification (inline edit, save/cancel)</li>
            <li>Summaries and P&L (charts/tables, export placeholders)</li>
            <li>Reconciliation (match status, manual resolve)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
