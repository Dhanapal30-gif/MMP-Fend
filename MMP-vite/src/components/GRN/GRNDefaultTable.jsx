import React from "react";
import { generateColumns } from "../../components/Com_Component/generateColumns";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { FaEdit } from "react-icons/fa";

const GRNDefaultTable = ({
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
}) => {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelect = (rowkey) => {
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowkey);
      return isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowkey)
        : [...prevSelectedRows, rowkey];
    });
  };

  // 👇 Add openOrderQty field dynamically
  const processedData = data.map((row) => ({
    ...row,
    openOrderQty: (Number(row.recevingQty) || 0) - (Number(row.orderqty) || 0),
  }));

  const customLabels = {
    openOrderQty: "OpenOrder Qty {recevingQty - orderqty}",
  };

  const columns = generateColumns({
    fields: [
      "EDIT",
      "recevingTicketNo",
      "ponumber",
      "vendorname",
      "postingdate",
      "partcode",
      "partdescription",
      "UOM",
      "TYC",
      "invoiceNo",
      "invoiceDate",
      "receivingDate",
      "recevingQty",
      "orderqty",
      "openOrderQty", // 👈 add new field
      "totalValue",
      "totalValueEuro",
      "unitprice",
      "grnqty",
      "grno",
      "grdate",
      "grcomments",

    ],
    customConfig: {
            recevingTicketNo: { label: "Receving TicketNo" },
            ponumber: { label: "PoNumber", },
            vendorname: { label: "Vendor Name" },
    postingdate: { label: "Posting Date",  }, 
            partcode: { label: "PartCode" },
            partdescription: { label: "Part Description" },
            invoiceNo: { label: "Invoice No" },
            invoiceDate: { label: "Invoice Date" },
            receivingDate: { label: "Receiving Date" },
            recevingQty: { label: "Receving Qty" },
            orderqty: { label: "order Qty" },
              openOrderQty: { label: "OpenOrder Qty" },
            totalValue: { label: "Total Value" },
            totalValueEuro: { label: "Total Value Euro" },
            unitprice: { label: "UnitPrice" },
            grno: { label: "GRN Number" },
            grnqty: { label: "GRN Qty" },
            grdate: { label: "GRN Date" },
            grcomments: { label: "GRN Comments" }

        },
    // onEdit,
    selectedRows,
    handleSelect,
    handleSelectAll,
    data: processedData,
    customCellRenderers: {
      EDIT: (row) => (
        <button className="edit-button" onClick={() => onEdit(row)}>
          <FaEdit />
        </button>
      ),
    },
    customLabels,
  });

  return (
    <div>
      <CommonDataTable
        columns={columns}
        data={processedData}
        loading={loading}
        pagination
        paginationServer
        page={page}
        perPage={perPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  );
};

export default GRNDefaultTable;
