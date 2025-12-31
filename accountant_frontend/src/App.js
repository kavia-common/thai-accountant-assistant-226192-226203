import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./components/ToastProvider";
import { DashboardLayout } from "./layout/DashboardLayout";
import HomePage from "./pages/HomePage";
import UploadsPage from "./pages/UploadsPage";
import TransactionsPage from "./pages/TransactionsPage";
import ClassificationPage from "./pages/ClassificationPage";
import SummariesPage from "./pages/SummariesPage";
import PnLPage from "./pages/PnLPage";
import ReconciliationPage from "./pages/ReconciliationPage";

/**
 * PUBLIC_INTERFACE
 * App entry: routes + dashboard layout + toasts.
 */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/uploads" element={<UploadsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/classification" element={<ClassificationPage />} />
          <Route path="/summaries" element={<SummariesPage />} />
          <Route path="/pnl" element={<PnLPage />} />
          <Route path="/reconciliation" element={<ReconciliationPage />} />
          <Route path="*" element={<Navigate to="/uploads" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
