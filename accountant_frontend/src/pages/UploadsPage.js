import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { uploadBankStatement, uploadReceipt } from "../api/endpoints";
import { ErrorNotice } from "../components/States";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function UploadPanel({ title, hint, accept, onUpload }) {
  const inputRef = useRef(null);
  const [isDrag, setIsDrag] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const busy = useMemo(() => items.some((x) => x.status === "uploading"), [items]);

  async function startUpload(file, idx) {
    setItems((prev) =>
      prev.map((x, i) => (i === idx ? { ...x, status: "uploading", progress: 10, error: "" } : x))
    );

    // Simulated progress for UX polish; real progress requires XHR.
    const timer = setInterval(() => {
      setItems((prev) =>
        prev.map((x, i) => {
          if (i !== idx || x.status !== "uploading") return x;
          const next = Math.min(90, (x.progress || 10) + Math.round(Math.random() * 10));
          return { ...x, progress: next };
        })
      );
    }, 350);

    try {
      const res = await onUpload(file);
      clearInterval(timer);
      setItems((prev) =>
        prev.map((x, i) =>
          i === idx ? { ...x, status: "done", progress: 100, server: res } : x
        )
      );
      toast.success(`${title}: uploaded "${file.name}"${res?.mock ? " (mock)" : ""}`);
    } catch (e) {
      clearInterval(timer);
      setItems((prev) =>
        prev.map((x, i) =>
          i === idx ? { ...x, status: "error", error: e.message || "Upload failed", progress: 0 } : x
        )
      );
      toast.error(`${title}: ${e.message || "Upload failed"}`);
    }
  }

  function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setError("");
    setItems((prev) => [
      ...prev,
      ...files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        file: f,
        status: "queued",
        progress: 0,
        error: "",
      })),
    ]);

    // Auto start upload for each new file
    setTimeout(() => {
      setItems((prev) => {
        const next = [...prev];
        files.forEach((f) => {
          const idx = next.findIndex((x) => x.file === f);
          if (idx >= 0) startUpload(f, idx);
        });
        return next;
      });
    }, 0);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDrag(false);
    if (busy) return;
    if (!e.dataTransfer?.files?.length) return;
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h2 className="cardTitle">{title}</h2>
          <p className="cardHint">{hint}</p>
        </div>
        <div className="row">
          <button
            className="btn btnPrimary btnSm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            Choose files
          </button>
          <button
            className="btn btnSm"
            onClick={() => setItems([])}
            disabled={busy || items.length === 0}
            title="Clear list"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="cardBody">
        {error ? <ErrorNotice title="Upload error" message={error} /> : null}

        <div
          className={`dropzone ${isDrag ? "dropzoneStrong" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setIsDrag(true);
          }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={onDrop}
          aria-label={`${title} dropzone`}
        >
          <div style={{ fontWeight: 900 }}>Drag & drop files here</div>
          <div style={{ marginTop: 8, color: "rgba(55, 65, 81, 0.75)", fontSize: 13 }}>
            or click to browse. Accepted: <span className="badge">{accept}</span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => addFiles(e.target.files)}
        />

        <div style={{ marginTop: 14 }}>
          {items.length === 0 ? (
            <div className="emptyState">
              <div style={{ fontWeight: 900, color: "#374151" }}>No files yet</div>
              <div style={{ marginTop: 6 }}>Upload files to start processing.</div>
            </div>
          ) : (
            <div className="tableWrap">
              <table className="table" aria-label={`${title} file list`}>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th style={{ width: 220 }}>Progress</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((x, idx) => (
                    <tr key={`${x.name}-${idx}`}>
                      <td style={{ fontWeight: 750 }}>{x.name}</td>
                      <td>{formatBytes(x.size)}</td>
                      <td>
                        {x.status === "queued" ? <span className="badge">Queued</span> : null}
                        {x.status === "uploading" ? <span className="badge badgeWarn">Uploading</span> : null}
                        {x.status === "done" ? <span className="badge badgeSuccess">Done</span> : null}
                        {x.status === "error" ? <span className="badge badgeError">Error</span> : null}
                      </td>
                      <td>
                        <div className="progressBar" aria-label="progress">
                          <div style={{ width: `${x.progress || 0}%` }} />
                        </div>
                      </td>
                      <td style={{ color: x.status === "error" ? "rgba(153,27,27,1)" : "rgba(55,65,81,0.75)" }}>
                        {x.status === "done" && x.server?.mock ? "Mock response (backend endpoint TODO)" : ""}
                        {x.status === "error" ? x.error : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12 }} className="notice">
          Processing happens in the backend (port 3001). If an endpoint is not ready yet, the UI will use a mock success
          response so you can continue exploring the workflow.
        </div>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Uploads page: bank statements and receipts.
 */
export default function UploadsPage() {
  return (
    <div className="grid2">
      <UploadPanel
        title="Bank Statements"
        hint="Upload CSV/PDF statements to parse transactions."
        accept=".csv,.pdf"
        onUpload={uploadBankStatement}
      />
      <UploadPanel
        title="Receipts"
        hint="Upload images/PDF receipts for matching and classification."
        accept="image/*,.pdf"
        onUpload={uploadReceipt}
      />
    </div>
  );
}
