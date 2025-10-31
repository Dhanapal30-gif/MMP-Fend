


import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { FaTimesCircle } from "react-icons/fa";

const PTLRequestAddTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  setTableData,
  setShowTable,
  setFormData,
  setIsFrozen

}) => {


  const handleRemoveRow = (indexToRemove) => {
    const newData = data.filter((_, index) => index !== indexToRemove);
    setTableData(newData);
    if (newData.length === 0)
      setFormData({
      
        partcode: "",
        partdescription: "",
        requestQuantity: "",
        
      })
    setShowTable(false);
    setIsFrozen(false)
  };

  const cancelColumn = {
    name: "----Cancel",
    cell: (row, index) => (
      <FaTimesCircle
        onClick={() => handleRemoveRow(index)}
        style={{
          color: "red",
          fontSize: "20px",
          cursor: "pointer",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  };

  const columns = [
    cancelColumn,
    ...generateColumns({
      fields: [
  
        "partcode",
        "partdescription",
        "requestQty",
        
      ],
      customConfig: {
     
        partcode: { label: "PartCode" },
        partdescription: { label: "Part Description" },
        
        requestQty: { label: "Request Quantity" },
      },
    }),
  ];


  return (
    <CommonDataTable
      columns={columns}
      data={data}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      onPageChange={setPage}
    //   onRowsPerPageChange={setPerPage}
                    onPerPageChange={setPerPage}

    />
  );
};

export default PTLRequestAddTable;
