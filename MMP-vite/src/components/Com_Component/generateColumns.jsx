// export const generateColumns = ({
//   fields,
//   onEdit,
//   selectedRows,
//   data = [],
//   handleSelect,
//   handleSelectAll,
//   customConfig = {},
//   showEdit = true,
//   customCellRenderers = {},
// }) => {
//   const totalColumns = fields.length + (selectedRows && handleSelect ? 1 : 0);
//   const equalWidth = `${100 / totalColumns}%`;

//   const dynamicColumns = fields.map((field) => ({
//     name: (
//       <div style={{ whiteSpace: "nowrap", overflow: "visible" }}>
//         {customConfig[field]?.label || field}
//       </div>
//     ),
//     selector: (row) => row[field],
//     cell: customCellRenderers[field]
//       ? (row, index) => customCellRenderers[field](row, index)
//       : (row) => row[field],
//     wrap: false,
//     minWidth: "150px",
//   }));

//   const baseColumns = [];

//   if (selectedRows && handleSelect) {
//     baseColumns.push({
//       name: (
//         <div style={{ paddingLeft: "15px" }}>
//           <span>Select</span>
//           <br />
//           <input
//             type="checkbox"
//             checked={selectedRows.length === data.length && data.length > 0}
//             onChange={handleSelectAll}
//           />
//         </div>
//       ),
//       cell: (row) => (
//         <div style={{ paddingLeft: "15px" }}>
//           <input
//             type="checkbox"
//             checked={selectedRows.includes(row.id)}
//             onChange={(e) => handleSelect(row.id, e.target.checked)}
//           />
//         </div>
//       ),
//       // width: equalWidth,
//     });
//   }

//   return [...baseColumns, ...dynamicColumns];
// };

// export const generateColumns = ({
//   fields,
//   selectedRows,
//   data = [],
//   handleSelect,
//   handleSelectAll,
//   customConfig = {},
//   customCellRenderers = {},
// }) => {
//   const baseColumns = [];

//   if (selectedRows && handleSelect) {
//     baseColumns.push({
//       name: (
//         <div style={{ paddingLeft: "15px" }}>
//           <span>Select</span>
//           <br />
//           <input
//             type="checkbox"
//             checked={selectedRows.length === data.length && data.length > 0}
//             onChange={handleSelectAll}
//           />
//         </div>
//       ),
//       cell: (row) => (
//         <div style={{ paddingLeft: "15px" }}>
//           <input
//             type="checkbox"
//             checked={selectedRows.includes(row.id)}
//             onChange={(e) => handleSelect(row.id, e.target.checked)}
//           />
//         </div>
//       ),
//       minWidth: "130px",
//     });
//   }

//   const dynamicColumns = fields.map((field) => {
//     const headerLabel = customConfig[field]?.label || field;

//     // Default width
//     let minWidth = 130;

//     // Only increase width for THIS column if header is long
//     if (field === "boardserialnumber" && headerLabel.length > 10) {
//       minWidth = headerLabel.length * 9;
//     }

//     return {
//       name: (
//         <div style={{ whiteSpace: "nowrap", overflow: "visible" }}>
//           {headerLabel}
//         </div>
//       ),
//       selector: (row) => row[field],
//       cell: customCellRenderers[field]
//         ? (row, index) => customCellRenderers[field](row, index)
//         : (row) => row[field],
//       wrap: field === "boardserialnumber", // wrap only this column if needed
//       minWidth: `${minWidth}px`,
//     };
//   });

//   return [...baseColumns, ...dynamicColumns];
// };

export const generateColumns = ({
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
          <input
            type="checkbox"
            checked={selectedRows.length === data.length && data.length > 0}
            onChange={handleSelectAll}
          />
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
    let minWidth = 130;

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
