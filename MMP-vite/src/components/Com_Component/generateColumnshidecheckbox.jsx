export const generateColumnshidecheckbox = ({
  fields,
  selectedRows,
  data = [],
  handleSelect,
  handleSelectAll,
  customConfig = {},
  customCellRenderers = {},
}) => {
  const columns = [];

   if (selectedRows && handleSelect) {
    columns.push({
      name: (
        <div style={{ paddingLeft: "23px" }}>
          <span>Select </span>
          <br />
          <input
            type="checkbox"
            checked={
              selectedRows.length ===
                data.filter((row) => row.is_done !== "1").length &&
              data.filter((row) => row.is_done !== "1").length > 0
            }
            onChange={handleSelectAll}
          />
        </div>
      ),
      cell: (row) =>
        
       row.is_done !== 1 ? (
        <div style={{ paddingLeft: "23px" }}>
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={() => handleSelect(row.id)}
          />
          </div>
        ) : null, // ✅ hide checkbox if done
      minWidth: "70px",
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

  return [...columns, ...dynamicColumns];
};
