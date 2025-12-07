import DataTable from 'react-data-table-component';

const CommonDataTable = ({
  columns,
  data,
  loading,
  totalRows,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  resetKey,
    selectedRows// ← important

}) => {

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    onPerPageChange(newPerPage, newPage);
  };

  return (
    <DataTable
  //    key={resetKey}                 
  // paginationDefaultPage={1} 
      columns={columns}
      data={data}
      progressPending={loading}
      pagination
      paginationServer
      paginationTotalRows={totalRows}
      paginationPerPage={perPage}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handlePerRowsChange}
      highlightOnHover
      fixedHeader
      fixedHeaderScrollHeight="400px"
      className="react-datatable"
      paginationRowsPerPageOptions={[10, 20, 30, 50]}
      
    />
  );
};

export default CommonDataTable;
