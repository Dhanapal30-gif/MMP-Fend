import React from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { FaEdit } from "react-icons/fa";

const CompatabilityDefaultTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    onEdit,
    selectedRows,
    setSelectedRows,
    setDeletButton,
    setAddButton,
    setUpdateButton
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
        setAddButton(newSelected.length === 0);
        setUpdateButton(newSelected.length ===0);
        // setSelectedRows([]);
        return newSelected;
    });
};


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
        { name: "Parent Partcode", selector: (row) => row.parentpartcode, wrap: true, width: "150px" },
        { name: "Parent Partdescription", selector: (row) => row.parentpartdescription, wrap: true, width: "250px" },
        { name: "Partcode", selector: (row) => row.partcode, wrap: true, width: "150px" },
        { name: "Partdescription", selector: (row) => row.partdescription, wrap: true, width: "250px" },
        { name: "Createdby", selector: (row) => row.createdby, wrap: true, width: "120px" },
        // { name: "Modifieddate", selector: (row) => row.modifieddate?.join("-") ?? "", wrap: true, width: "150px" },
    ];

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: "#1976d2",
                color: "white",
                // fontWeight: "bold",
                // fontSize: "14px",
                whiteSpace: "nowrap",
            },
        },
        rows: {
            style: {
                minHeight: "45px",
                // fontSize: "13px",
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
            data={data}
            page={page}
            perPage={perPage}
            totalRows={totalRows}
            loading={loading}
            pagination
            paginationServer
            onPageChange={(p) => setPage(p - 1)}
            onPerPageChange={setPerPage}
            customStyles={customStyles}
        />
    );
};

export default CompatabilityDefaultTable;


/*
import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { TextField } from "@mui/material";
import { saveDoneRequest, savePickequest } from '../../Services/Services_09';
import CryptoJS from "crypto-js";
import { FaEdit } from "react-icons/fa";


const fields = [
    "EDIT",
    "parentpartcode",
    "parentpartdescription",
    "partcode",
    "partdescription",
    "createdby",
    "modifieddate",
   
];

const customConfig = {
    parentpartcode: { label: "Parent Partcode" },
    parentpartdescription: { label: "Parent Partdescription" },
    partcode: { label: "Partcode" },
    partdescription: { label: "Partdescription" },
    createdby: { label: "Createdby" },
    modifieddate: { label: "Modifieddate" },
   
};


const CompatabilityDefaultTable = ({
    data = [],
    page,
    perPage,
    totalRows,
    loading,
    setPage,
    setPerPage,
    handleQtyChange,
    formData,
    pickButton,
    setpickButton,
    setSuccessMessage,
    setShowSuccessPopup,
    onEdit,
      selectedRows,
  setSelectedRows,
}) => {

    //  const columns = generateColumns({
    //         fields: [
    //           "requestTicketNo",
    //           "requesterType",
    //           "requestFor",
    //           "orderType",
    //           "productName",
    //           "productGroup",
    //           "productFamily",
    //           "partCode",
    //           "partDescription",
    //           "UOM",
    //           "typeOfComponents",
    //           "componanetUsage",
    //           "compatibilityPartcode",
    //           "requestQty",
    //           "approved1Qty",
    //           "approved2Qty",
    //           "faultySerialNo",
    //           "faultyUnitModuleSerialNo"

    //         ]


    //       })   
    // Generate columns and prepend Cancel column manually
    // const columns = React.useMemo(() => {
    //     return generateColumns({ fields, customConfig ,});
    // }, [fields, customConfig]);


  const handleSelect = (rowkey) => {
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowkey);
      return isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowkey)
        : [...prevSelectedRows, rowkey];
    });
  };

    const columns = React.useMemo(() => {
    return generateColumns({
        fields,
        customConfig,
        selectedRows,
        handleSelect,
        customCellRenderers: {
            EDIT: (row) => (
                <button className="edit-button" style={{marginLeft:"10px"}} onClick={() => onEdit(row)}>
                    <FaEdit />
                </button>
            ),
        },
    });
}, [fields, customConfig, onEdit]); // ✅ include onEdit if it’s a function


    // Flatten {label, value} objects
    const normalizedData = React.useMemo(() => {
        return data.map(row => {
            const newRow = { ...row };
            Object.keys(newRow).forEach(key => {
                if (typeof newRow[key] === "object" && newRow[key] !== null) {
                    newRow[key] = newRow[key].label ?? JSON.stringify(newRow[key]);
                }
            });
            return newRow;
        });
    }, [data]);


    return (
        <CommonDataTable
            columns={columns}
            data={data}
            page={page}
            pagination
            paginationServer
            perPage={perPage}
            totalRows={totalRows}
            loading={loading}
            // onPageChange={setPage}
            onPageChange={(p) => setPage(p - 1)}   // <-- subtract 1

            onPerPageChange={setPerPage}

        />)
}

export default CompatabilityDefaultTable

*/