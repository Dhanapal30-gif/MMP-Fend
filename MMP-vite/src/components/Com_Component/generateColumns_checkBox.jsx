
export const generateColumns_checkBox = ({
  fields,
  selectedRows,
  data = [],
  handleSelect,
  handleSelectAll,
  customConfig = {},
  customCellRenderers = {},
}) => {
  const baseColumns = [];

  if (selectedRows && handleSelect) {
    baseColumns.push({
      name: (
        <div style={{ paddingLeft: "15px" }}>
          <span>Select</span>
          <br />
          
        </div>
      ),
      cell: (row) => (
        <div style={{ paddingLeft: "15px" }}>
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => handleSelect(row.id, e.target.checked)}
          />
        </div>
      ),
      minWidth: "130px",
    });
  }

  const dynamicColumns = fields.map((field) => {
    const headerLabel = customConfig[field]?.label || field;

    // Default width
    let minWidth = 150;

    // Increase width only if header text is long
    if (headerLabel.length > 10) {
      minWidth = Math.max(minWidth, headerLabel.length * 9); // flexible calculation
    }

    return {
      name: (
        <div style={{ whiteSpace: "nowrap", overflow: "visible" }}>
          {headerLabel}
        </div>
      ),
      selector: (row) => row[field],
      cell: customCellRenderers[field]
        ? (row, index) => customCellRenderers[field](row, index)
        : (row) => row[field],
      wrap: headerLabel.length > 15, // wrap long headers
      minWidth: `${minWidth}px`,
    };
  });

  return [...baseColumns, ...dynamicColumns];
};
