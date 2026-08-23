/**
 * 查询结果表格组件
 * 将后端返回的结构化数据归一化为可滚动表格
 */
import { Database, FileJson } from "lucide-react";

function normalizeRows(data: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(data)) {
    return data.map((item, index) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? (item as Record<string, unknown>)
        : { 序号: index + 1, 值: item },
    );
  }

  if (data && typeof data === "object") {
    return [data as Record<string, unknown>];
  }

  return [{ 值: data ?? "" }];
}

function formatCell(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ResultTable({ data }: { data: unknown }) {
  const rows = normalizeRows(data);
  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );

  if (columns.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 overflow-hidden border border-neon/20 bg-surface/60 shadow-line">
      <div className="flex items-center justify-between border-b border-neon/15 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-sm font-semibold text-neon">
          <Database className="h-4 w-4" aria-hidden="true" />
          [ QUERY_RESULT ]
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
          <FileJson className="h-3.5 w-3.5 text-matrix/70" aria-hidden="true" />
          rows={rows.length}
        </div>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left font-mono text-sm">
          <thead className="sticky top-0 z-10 bg-panel">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="border-b border-neon/15 px-4 py-3 font-semibold text-neon/80"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-surface/40 even:bg-terminal/40">
                {columns.map((column) => (
                  <td key={column} className="border-b border-border/50 px-4 py-3 text-ink/85">
                    {formatCell(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
