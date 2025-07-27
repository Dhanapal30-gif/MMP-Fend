export const generateColumns = ({
  fields,
  onEdit,
  selectedRows,
  data = [],

  handleSelect,

  handleSelectAll,
  customConfig = {},
  showEdit = true,
  customCellRenderers = {},
}) => {

  const dynamicColumns = fields.map((field) => ({
    name: customConfig[field]?.label || field,
    selector: row => row[field],
    cell: customCellRenderers[field]
      ? (row, index) => customCellRenderers[field](row, index)
      : row => row[field],
    wrap: true,
    width: customConfig[field]?.width || '130px',
  }));


  const baseColumns = [];


if (selectedRows && handleSelect ) {
    baseColumns.push({
      name: (
        <div style={{ paddingLeft: '15px' }}>
          <span>Select</span><br></br>
          <input
            type="checkbox"
            checked={selectedRows.length === data.length && data.length > 0}
            onChange={handleSelectAll}
          />
        </div>
      ),
      cell: (row) => (
        <div style={{ paddingLeft: '15px' }}>
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => handleSelect(row.id, e.target.checked)}
          />
        </div>
      )
    });
  }
  // Add Edit column only if showEdit is true and onEdit exists
  if (showEdit && onEdit) {
    baseColumns.push({
      name: "Edit",
      cell: row => (
        <button className="edit-button" onClick={() => onEdit(row)}>
          Edit
        </button>
      ),
      width: "80px",
    });
  }

  return [...baseColumns, ...dynamicColumns];
};
