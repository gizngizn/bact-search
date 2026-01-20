export default function ResistanceTable({ resistances }) {
  if (!resistances || resistances.length === 0) {
    return (
      <div className="resistance-table-empty">
        No intrinsic resistance data available
      </div>
    );
  }

  // Group by antimicrobial group
  const groupedResistances = resistances.reduce((acc, r) => {
    const groupName = r.group && r.group.length > 0 ? r.group[0] : 'Other';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(r);
    return acc;
  }, {});

  return (
    <div className="resistance-table">
      <table>
        <thead>
          <tr>
            <th>Antimicrobial Group</th>
            <th>Antimicrobial</th>
            <th>Code</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedResistances).map(([group, items]) => (
            items.map((r, idx) => (
              <tr key={r.ab}>
                {idx === 0 && (
                  <td rowSpan={items.length} className="group-cell">
                    {group}
                  </td>
                )}
                <td>{r.name}</td>
                <td className="code-cell">{r.ab}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}
