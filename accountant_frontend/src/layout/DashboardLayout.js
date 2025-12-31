import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/uploads", label: "Uploads", icon: "⤒" },
  { to: "/transactions", label: "Transactions", icon: "≋" },
  { to: "/classification", label: "Classification", icon: "✓" },
  { to: "/summaries", label: "Summaries", icon: "◴" },
  { to: "/pnl", label: "P&L", icon: "฿" },
  { to: "/reconciliation", label: "Reconciliation", icon: "⇄" },
];

function pageMeta(pathname) {
  if (pathname.startsWith("/uploads")) return { title: "Uploads", subtitle: "Bank statements and receipts" };
  if (pathname.startsWith("/transactions")) return { title: "Transactions", subtitle: "Filter, review, and bulk edit" };
  if (pathname.startsWith("/classification")) return { title: "Classification", subtitle: "Review and override categories/tags" };
  if (pathname.startsWith("/summaries")) return { title: "Summaries", subtitle: "Quick insights across your data" };
  if (pathname.startsWith("/pnl")) return { title: "Profit & Loss", subtitle: "Elegant financial reporting" };
  if (pathname.startsWith("/reconciliation")) return { title: "Reconciliation", subtitle: "Match transactions to receipts" };
  return { title: "Dashboard", subtitle: "Accountant Assistant" };
}

/**
 * PUBLIC_INTERFACE
 * Main dashboard layout: sidebar + topbar + routed content.
 */
export function DashboardLayout() {
  const { pathname } = useLocation();
  const meta = pageMeta(pathname);

  return (
    <div className="appRoot">
      <div className="dashboard">
        <aside className="sidebar" aria-label="Sidebar navigation">
          <div className="brand">
            <div className="brandMark" aria-hidden="true" />
            <div className="brandTitle">
              <strong>Thai Accountant</strong>
              <span>Assistant</span>
            </div>
          </div>

          <div className="navGroup">
            <div className="navHeading">Workspace</div>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}
              >
                <span className="navIcon" aria-hidden="true">
                  {item.icon}
                </span>
                <span style={{ fontWeight: 750 }}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: "0 10px" }}>
            <div className="notice">
              <div style={{ fontWeight: 850, marginBottom: 4 }}>Tip</div>
              <div style={{ color: "rgba(55, 65, 81, 0.85)" }}>
                Start by uploading a bank statement, then classify transactions and reconcile receipts.
              </div>
            </div>
          </div>
        </aside>

        <section className="content">
          <header className="topbar" role="banner">
            <div className="pageTitleWrap">
              <h1 className="pageTitle">{meta.title}</h1>
              <p className="pageSubtitle">{meta.subtitle}</p>
            </div>
            <div className="topbarRight">
              <span className="pill" title="Backend base URL">
                <span aria-hidden="true">API</span>
                <span style={{ fontWeight: 800 }}>
                  {process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"}
                </span>
              </span>
              <span className="pill">
                <span className="avatar" aria-hidden="true" />
                <span style={{ fontWeight: 800 }}>Accountant</span>
              </span>
            </div>
          </header>

          <main className="main">
            <Outlet />
          </main>
        </section>
      </div>
    </div>
  );
}
