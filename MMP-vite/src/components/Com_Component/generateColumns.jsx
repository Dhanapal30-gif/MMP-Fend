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
  const totalColumns = fields.length + (selectedRows && handleSelect ? 1 : 0);
  const equalWidth = `${100 / totalColumns}%`; // dynamic equal width in %

 const dynamicColumns = fields.map((field) => ({
  name: (
    <div style={{ whiteSpace: 'nowrap', overflow: 'visible' }}>
      {customConfig[field]?.label || field}
    </div>
  ),
  selector: row => row[field],
  cell: customCellRenderers[field]
    ? (row, index) => customCellRenderers[field](row, index)
    : row => row[field],
  wrap: false, // prevent header wrapping
  minWidth: '130px', // optional, prevents extremely small columns
}));


  const baseColumns = [];

  if (selectedRows && handleSelect) {
    baseColumns.push({
      name: (
        <div style={{ paddingLeft: '15px' }}>
          <span>Select</span><br />
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
      ),
      width: equalWidth, // same width for checkbox column
    });
  }

  return [...baseColumns, ...dynamicColumns];
};
