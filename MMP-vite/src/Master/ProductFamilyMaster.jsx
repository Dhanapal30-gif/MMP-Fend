import React, { useEffect, useState } from 'react'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

import './ProductMaster.css'
import { getProductMasterData, getUserMailId, saveProductMaster, updateProduct } from '../ServicesComponent/Services';
//import './Approval.css'

const ProductFamilyMaster = () => {
  const [formErrors, setFormErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [productMaster, setProductMaster] = useState([]);
  const [userMailData, setUserMailData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSubmitButton, setHandleSubmitButton] = useState(true);
  const [handleUpdateButton, setHandleUpdateButton] = useState(false);

  const filterProduct = productMaster.flatMap(row => row.productEngineer || [])
  console.log("productMaster.productEngineer", filterProduct)
  const [formData, setFormData] = useState({
    productname: '',
    productgroup: '',
    productfamily: '',
    createdby: '',
    productEngineer: [],
    modifiedby: '',
    lineLead: [],
    recordstatus: '',
  })
  const fetchData = {
    productname: '',
    productgroup: '',
    productfamily: '',
    productEngineer: '',
    lineLead: '',
    recordstatus: '',
    page: 0,
    size: 10
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const valiDate = () => {
    const errors = {};
    let isValid = true; // Assume valid initially

    if (!formData.productname) {
      errors.productname = "Please Enter Product Name";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid; // Now it correctly returns false if any field is empty
  };




  useEffect(() => {
    fetchProduct(page, perPage);
    // getUserMailId();
  }, [page, perPage]);

  useEffect(() => {
    getUserMail();
  }, []);  // Runs only once



  const handleSubmit = (e) => {
    e.preventDefault();

    if (!valiDate()) return; // Stop execution if validation fails

    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = {
      ...formData,
      createdby,
      modifiedby,
    };

    console.log("updatedFormData", updatedFormData);

    saveProductMaster(updatedFormData)
      .then((response) => {
        alert("Account Created Successfully");
        setFormData({
          productname: "",
          productgroup: "",
          productfamily: "",
          lineLead: "",
          recordstatus: "",
          productEngineer: "",
        });
        fetchProduct(page, perPage);

      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            alert("Product already exists");
          } else {
            alert("Something went wrong");
          }
        } else {
          alert("Network error, please try again");
        }
      });

    setFormData({
      productname: "",
      productgroup: "",
      productfamily: "",
      lineLead: "",
      recordstatus: "",
      productEngineer: "",
    });
  };



  const fetchProduct = (search, page = 1, size = 10) => {
    getProductMasterData(search, page - 1, size) // Pass as separate arguments
      .then((response) => {
        console.log("fetchProduct:", response);
        setProductMaster(response.data.content || []);
        setTotalRows(response.data.totalElements || 0);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  };



  console.log("Updated productMaster:", productMaster);


  const handlePageChange = (newPage) => {
    console.log("Page changed to:", newPage);
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(productMaster.map((row) => row.productname)); // ✅ Ensure unique selection key
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (rowKey) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(rowKey)
        ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect row
        : [...prevSelectedRows, rowKey] // Select row
    );
  };
  const calculateColumnWidth = (data, key, minWidth = 190, maxWidth = 318) => {
    if (!data || data.length === 0) return minWidth;
  
    const maxLength = Math.max(...data.map(row => (row[key] ? row[key].toString().length : 0)));
    const width = maxLength * 8; // Adjust the multiplier as needed for better fit
  
    return Math.min(Math.max(width, minWidth), maxWidth);
  };
  const columns = [
    //{ name: "Delete", selector: row => <input type="checkbox" />, width: "90px" },
    {
      name: (
        <div style={{ textAlign: "center" }}>
          <label>Delete All</label>
          <br />
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={selectedRows.length === productMaster.length && productMaster.length > 0}
          />
        </div>
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.productname)} // ✅ Ensure row selection works properly
          onChange={() => handleRowSelect(row.productname)}
        />
      ),
      width: "130px",
    },



    { name: "Edit", selector: row => (<button className="btn btn-warning btn-sm" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
    { name: "Product Name", selector: row => row.productname || "N/A", sortable: true , width: `${calculateColumnWidth(productMaster, 'productname')}px`
  },
    { name: "Product Group", selector: row => row.productgroup || "N/A" ,    width: `${calculateColumnWidth(productMaster, 'productgroup')}px`
  },
    { name: "Product Family", selector: row => row.productfamily || "N/A" ,    width: `${calculateColumnWidth(productMaster, 'productfamily')}px`
   },


    ///{ name: "Line Lead", selector: row => row.lineLead || "N/A",minWidth: "250px", maxWidth: "700px" },

    {
      name: "Line Lead",
      selector: row => row.lineLead
        ? row.lineLead.split(",").map(email => <div key={email}>{email}</div>)
        : "N/A",     width: `${calculateColumnWidth(productMaster, 'lineLead')}px`

    },
    {
      name: "Product Engineer",
      selector: row => row.productEngineer
        ? row.productEngineer.split(",").map(email => <div key={email}>{email}</div>)
        : "N/A",       width: `${calculateColumnWidth(productMaster, 'productEngineer')}px`


    },

    { name: "status", selector: row => row.recordstatus || "N/A" ,    width: `${calculateColumnWidth(productMaster, 'recordstatus')}px`
  },

    // { name: "Product Engineer", selector: row => row.productEngineer || "N/A" }
  ];


  const filteredData = productMaster.filter(row =>
    Object.values(row).some(value =>
      typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, "UserList.xlsx");
  };

  const formClear = () => {
    setFormData({ productname: '', productgroup: '', productfamily: '', createdBy: '', lineLead: '', productEngineer: '', status: '' });
    setHandleSubmitButton(true);
    setHandleUpdateButton(false);
  }

  const getUserMail = () => {
    getUserMailId()
      .then((response) => {
        console.log("getUserMailId:", response.data);
        setUserMailData(response.data || []);
      })
    console.log("Updated userMailData:", userMailData);

  }

  const handleEdit = (row) => {
    console.log("Editing Row Data:", row);  // Debugging

    setFormData({
      id:row.id || "" ,
      productname: row.productname || "",
      productgroup: row.productgroup || "",
      productfamily: row.productfamily || "",
      recordstatus: row.recordstatus || "",
      lineLead: row.lineLead ? (Array.isArray(row.lineLead) ? row.lineLead : row.lineLead.split(",")) : [],
      productEngineer: row.productEngineer ? (Array.isArray(row.productEngineer) ? row.productEngineer : row.productEngineer.split(",")) : [],
    });

    setIsModalOpen(true);
    setHandleSubmitButton(false);
    setHandleUpdateButton(true);
  };

  


  const handleUpdate = (e, id) => {
    e.preventDefault(); // Ensure 'e' is correctly passed

    if (!valiDate()) return; // Stop execution if validation fails

    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = {
      ...formData,
      id,  // ✅ Ensure ID is passed
      modifiedby,
    };

    console.log("Updating product ID:", id);
    console.log("updatedFormData", updatedFormData);

    if (!id) {
      alert("Error: Product ID is missing!");
      return;
    }

    updateProduct(id, updatedFormData) 
      .then((response) => {
        alert("Product Updated Successfully");
        setFormData({
          productname: "",
          productgroup: "",
          productfamily: "",
          lineLead: "",
          recordstatus: "",
          productEngineer: "",
        });
        setHandleSubmitButton(true);
    setHandleUpdateButton(false);
        fetchProduct(page, perPage);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            alert("Product already exists");
          } else {
            alert("Something went wrong");
          }
        } else {
          alert("Network error, please try again");
        }
      });
};

const handleDownloadExcel = () => {
  // Define the header and data format
  const worksheetData = [
      ["Product Name", "Product Group", "Product Family", "Line Lead", "Record Status", "Product Engineer"], // Headers
      //[formData.productname, formData.productgroup, formData.productfamily, formData.lineLead, formData.recordstatus, formData.productEngineer] // Data
  ];

  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

  // Create an Excel file and trigger download
  XLSX.writeFile(workbook, "Product_Data.xlsx");
};


  return (
    <div className='productFamilyContainer'>

      <div className='productFamilyInput'>
        <div className='prodcutFamilyName'>
          <h5>Product Family Master</h5>
        </div>
        <div className='productUpload'>
          <button style={{ backgroundColor: '' }} >Excel Upload</button>
          <button onClick={handleDownloadExcel}>Excel Download</button>
        </div>
        <div className='ProductTexfiled'>
          <TextField
            id="outlined-basic"
            label="Product Name"
            variant="outlined"
            name="productname"
            value={formData.productname}
            onChange={handleChange}
            // onChange={(e) => setFormData({ ...formData, productname: e.target.value })}

            error={Boolean(formErrors.productname)}
            helperText={formErrors.productname}
            sx={{ "& .MuiInputBase-root": { height: "40px" } }}
          />
          <TextField
            id="outlined-basic"
            label="Product Group"
            variant="outlined"
            name="productgroup"
            value={formData.productgroup}
            onChange={handleChange}
            //  onChange={(e) => setFormData({ ...formData, productname: e.target.value })}
            error={Boolean(formErrors.outstandingAmount)}
            helperText={formErrors.outstandingAmount}
            sx={{ "& .MuiInputBase-root": { height: "40px" } }}
          />
          <TextField
            id="outlined-basic"
            label="Product Family"
            variant="outlined"
            name="productfamily"
            value={formData.productfamily}
            onChange={handleChange}
            //onChange={(e) => setFormData({ ...formData, productname: e.target.value })}
            error={Boolean(formErrors.outstandingAmount)}
            helperText={formErrors.outstandingAmount}
            sx={{ "& .MuiInputBase-root": { height: "40px" } }}
          />

          <Autocomplete
            options={["Active", "Inactive"]}
            getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
            value={formData.status || []}
            onChange={(event, newValue) => setFormData({ ...formData, status: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Status"
                variant="outlined"
                error={Boolean(formErrors.status)}
                helperText={formErrors.status}
                sx={{ "& .MuiInputBase-root": { height: "40px" } }}
              />
            )}
          />



          <Autocomplete
            multiple
            options={[...new Set(userMailData)]}  // ✅ Removes duplicates
            getOptionLabel={(option) => option}
            value={formData.lineLead || []}
            onChange={(event, newValue) => setFormData({ ...formData, lineLead: newValue || [] })}
            // onChange={(e) => setFormData({...formData, lineLead: e.target.value.split(",")})}

            renderInput={(params) => (
              <TextField
                {...params}
                label="Line Lead"
                variant="outlined"
                error={Boolean(formErrors.lineLead)}
                helperText={formErrors.lineLead}
                sx={{ "& .MuiInputBase-root": { height: 'auto' } }}
              />
            )}
          />

          <Autocomplete
            multiple
            options={[...new Set(userMailData)]}  // ✅ Removes duplicates
            getOptionLabel={(option) => option}
            value={formData.productEngineer || []}
            onChange={(event, newValue) => setFormData({ ...formData, productEngineer: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product Engineer"
                variant="outlined"
                error={Boolean(formErrors.productEngineer)}
                helperText={formErrors.productEngineer}
                sx={{ "& .MuiInputBase-root": { height: 'auto' } }}
              />
            )}
          />

        </div>

        <div className='productButton9'>
  {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
  {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
  <button onClick={formClear}>Clear</button>
</div>
      </div>

      <div className='productFamilyTable'>
        <h5 className='prodcutTableName'>All product deatil</h5>

        <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '-13px' }}>
          <button className="btn btn-success" onClick={exportToExcel} style={{ fontSize: '13px' }}>
            <FaFileExcel /> Export
          </button>

          <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
            <input type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }} placeholder="Search..." value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <span
                onClick={() => setSearchText("")}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold" }} >
                ✖
              </span>
            )}
          </div>

        </div>

        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          progressPending={loading}
          paginationTotalRows={totalRows}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page:',
            rangeSeparatorText: 'of',
            noRowsPerPage: false,
            selectAllRowsItem: true,
            selectAllRowsItemText: 'All',
          }}
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="400px"
          className="react-datatable"
          customStyles={{
            headRow: {
              style: {
                background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                color: "white",
                fontWeight: "bold",
                fontSize: "14px",
                textAlign: "center",
                minHeight: "40px",
              },
            },
            rows: {
              style: {
                fontSize: "14px",
                textAlign: "center",
                alignItems: "center", // Centers content vertically

                fontFamily: "Arial, Helvetica, sans-serif",
              },
            },
            cells: {
              style: {
                padding: "5px",  // Removed invalid negative padding
                //textAlign: "center",
                justifyContent: "center",  // Centers header text


              },
            },
            headCells: {
              style: {
                display: "flex",
                justifyContent: "center",  // Centers header text
                alignItems: "left",
                textAlign: "left",
              },
            },
            pagination: {
              style: {
                border: "1px solid #ddd",
                backgroundColor: "#f9f9f9",
                color: "#333",
                minHeight: "35px",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "bolder",
                display: "flex",
                justifyContent: "flex-end", // Corrected
                alignItems: "center", // Corrected
              },
            },
          }}
        />

      </div>
      <div className='container'></div>
    </div>
  )
}

export default ProductFamilyMaster