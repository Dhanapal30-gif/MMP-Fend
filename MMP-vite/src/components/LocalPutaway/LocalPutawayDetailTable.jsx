


import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { FaEdit } from "react-icons/fa";
const formatDateArray = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length < 6) return "";
  const [year, month, day, hour, minute, second] = arr;
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
};

const LocalPutawayDetailTable = ({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
  selectedRows,
  setSelectedRows,
  onEdit,
  setDeletButton
}) => {
   const handleSelect = (rowKey) => {
    setSelectedRows((prevSelectedRows) => {
        let newSelected;
        if (prevSelectedRows.includes(rowKey)) {
            newSelected = prevSelectedRows.filter((key) => key !== rowKey);
        } else {
            newSelected = [...prevSelectedRows, rowKey];
        }

        // Update delete button based on selection
        setDeletButton(newSelected.length > 0);
        // setAddButton(newSelected.length === 0);
        // setUpdateButton(newSelected.length ===0);
        // setSelectedRows([]);
        return newSelected;
    });
};
  const processedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      createddate: formatDateArray(item.createddate),
    }));
  }, [data]);

  const columns = [
    {
    name: "Select",
    width: "80px",
    center: true,
    cell: (row) => (
      <input
        type="checkbox"
        checked={selectedRows.includes(row.id)}
        onChange={() => handleSelect(row.id)}
        style={{ width: "16px",marginLeft:"10px", height: "14px" }}
      />
    ),
  },
    {
      name: "Edit",
      width: "60px",
      center: true,
      cell: (row) => (
        <button className="edit-button" onClick={() => onEdit(row)}>
          <FaEdit />
        </button>
      ),
    },
    { name: "Part Code", selector: (row) => row.partcode, sortable: true, wrap: true },
    { name: "Part Description", selector: (row) => row.partdescription, wrap: true },
    { name: "Rack Location", selector: (row) => row.racklocation, wrap: true },
    { name: "Putaway Qty", selector: (row) => row.putawayqty, wrap: true },
    // { name: "Created By", selector: (row) => row.createdby, wrap: true },
    { name: "Created Date", selector: (row) => row.createddate, wrap: true },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#1976d2",
        color: "white",
        fontWeight: "bold",
        fontSize: "14px",
        whiteSpace: "nowrap",
      },
    },
    rows: {
      style: {
        minHeight: "45px",
        fontSize: "13px",
      },
    },
    cells: {
      style: {
        padding: "8px",
        whiteSpace: "normal",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
    table: {
      style: {
        borderRadius: "8px",
        overflow: "hidden",
      },
    },
  };

  return (
    <CommonDataTable
      columns={columns}
      data={processedData}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      pagination
      paginationServer
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      customStyles={customStyles}
    />
  );
};

export default LocalPutawayDetailTable;

/*
import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { FaEdit } from "react-icons/fa";

const formatDateArray = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length < 6) return "";
  const [year, month, day, hour, minute, second] = arr;
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
};

const fields = [  "Edit",
"partcode", "partdescription", "racklocation", "putawayqty", "createdby", "createddate"];

const customConfig = {
  partcode: { label: "Part Code" ,width: "10px",},
  partdescription: { label: "Part Description", width: "379px" },
  racklocation: { label: "Rack Location", width: "150px" },
  putawayqty: { label: "Putaway Qty", width: "130px" },
  createdby: { label: "Created By", width: "120px" },
  createddate: { label: "Created Date", width: "180px" },
};
const LocalPutawayDetailTable =
({
  data = [],
  page,
  perPage,
  totalRows,
  loading,
  setPage,
  setPerPage,
    onEdit,
}) => {
      // console.log("data",data)

  const processedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      createddate: formatDateArray(item.createddate),
    }));
  }, [data]);


  // const columns = React.useMemo(() => generateColumns({ fields, customConfig, data: processedData }), [fields, customConfig, processedData]);
const columns = generateColumns({
    fields,
    data: processedData,
    customConfig,
    customCellRenderers: {
      Edit: (row) => (
        <button className="edit-button" onClick={() => onEdit(row)}>
          <FaEdit />
        </button>
      ),
    },
  });
  return (
    <CommonDataTable
      columns={columns}
      data={processedData}
      page={page}
      perPage={perPage}
      totalRows={totalRows}
      loading={loading}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    />
  );
}

export default LocalPutawayDetailTable

*/


