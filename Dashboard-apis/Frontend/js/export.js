// frontend/js/export.js
import { loadData } from "./table.js";

export async function exportJSON(api) {
  const rows = await loadData(api);
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${api.title}.json`;
  link.click();
}

export async function exportCSV(api) {
  const rows = await loadData(api);
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${api.title}.csv`;
  link.click();
}
