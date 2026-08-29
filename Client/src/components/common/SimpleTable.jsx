// Shared list-page table: every Admin/Staff sub-page (Programs, Events,
// Volunteers, Orphans, Donors, Donations, Assignments...) is "fetch a
// list, render it as a table" — this is the one place that pattern lives
// instead of ~13 near-identical <table> blocks.
// columns: [{ key, label, render?(row) }]
export default function SimpleTable({ columns, rows, emptyMessage = 'Nothing here yet.' }) {
  if (!rows || rows.length === 0) {
    return <p className="dashboard-note">{emptyMessage}</p>;
  }
  return (
    <table className="table">
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id ?? i}>
            {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
