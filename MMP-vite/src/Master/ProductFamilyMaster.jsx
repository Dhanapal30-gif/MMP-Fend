import React, { useRef, useEffect, useState } from 'react'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

import './ProductMaster.css'
import { deleteproduct, downloadProduct, getProductMasterData, getUserMailId, saveProductMaster, saveProductsBulk, updateProduct } from '../ServicesComponent/Services';
import CustomDialog from "../COM_Component/CustomDialog";

const ProductFamilyMaster = () => {
  const [formErrors, setFormErrors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [productMaster, setProductMaster] = useState([]);
  const [userMailData, setUserMailData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [uploadTotalRows, setUploadTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSubmitButton, setHandleSubmitButton] = useState(true);
  const [handleUpdateButton, setHandleUpdateButton] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [handleUploadButton, setHandleUploadButton] = useState(false);
  const [showUploadTable, setShowUploadTable] = useState(false);
  const [showProductTable, setShowProductTable] = useState(true);
  const [excelUploadData, setExcelUploadData] = useState([]);
  const [deletButton, setDeletButton] = useState();
  const filterProduct = productMaster.flatMap(row => row.productEngineer || [])
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
    fetchProduct(page, perPage, debouncedSearch);
    // getUserMailId();
  }, [page, perPage, debouncedSearch]);

  useEffect(() => {
    getUserMail();
  }, []);  // Runs only once


  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchText); // Wait 500ms after typing
    }, 500);

    return () => clearTimeout(delay); // Cleanup on new key press
  }, [searchText]);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!valiDate()) return; // Stop execution if validation fails

    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = {
      ...formData,
      createdby,
      modifiedby,
      //lineLead: [],
      //productEngineer: [],


    };

    saveProductMaster(updatedFormData)
      .then((response) => {
        setSuccessMessage("Product Updated Successfully");
        setShowSuccessPopup(true);
        setFormData({
          productname: "",
          productgroup: "",
          productfamily: "",
          lineLead: [],
          recordstatus: "",
          productEngineer: [],
        });
        fetchProduct(page, perPage);
        setPage(1);

      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage("Product already exists");
            setShowErrorPopup(true);
          } else {
            setErrorMessage("Something went wrong");
            setShowErrorPopup(true);
          }
        } else {
          setErrorMessage("Network error, please try again");
          setShowErrorPopup(true);
        }
      });

    setFormData({
      productname: "",
      productgroup: "",
      productfamily: "",
      lineLead: [],
      recordstatus: "",
      productEngineer: [],
    });
  };

  //FetchAllproduct
  const fetchProduct = (page = 1, size = 10, search = "") => {
    getProductMasterData(page - 1, size, search) // Pass as separate arguments
      .then((response) => {
        setProductMaster(response.data.content || []);
        setTotalRows(response.data.totalElements || 0);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  };

  //Pagenation
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const paginatedData = excelUploadData.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  //DeleteAll
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(productMaster.map((row) => row.id)); // ✅ Ensure unique selection key
      setDeletButton(true);
      setHandleSubmitButton(false);
      setHandleUpdateButton(false);
      setFormData({ productname: "", productgroup: "", productfamily: "", lineLead: "", productEngineer: "" });
    } else {
      setSelectedRows([]);
      setDeletButton(false);
      setHandleSubmitButton(true);
    }
  };

  //console
  useEffect(() => {
    console.log("setSelectedRows:", selectedRows); // Logs the updated state
  }, [selectedRows]);

  const handleRowSelect = (rowKey) => {
    setHandleUpdateButton(false);
    setFormData({ productname: "", productgroup: "", productfamily: "", lineLead: "", productEngineer: "" });
    setHandleSubmitButton(false);
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowKey);

      // Update selected rows
      const updatedRows = isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect row
        : [...prevSelectedRows, rowKey]; // Select row

      // Conditional button states based on updated rows
      if (updatedRows.length === 0) {
        setDeletButton(false); // Disable delete button if no rows are selected
        setHandleSubmitButton(true); // Enable submit button
      } else {
        setDeletButton(true); // Enable delete button if rows are selected
        setHandleSubmitButton(false); // Disable submit button
      }

      return updatedRows;
    });
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
          <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === productMaster.length && productMaster.length > 0} />
        </div>
      ),
      cell: (row) => (
        <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)} />
      ),
      width: "130px",
    },
    { name: "Edit", selector: row => (<button className="btn btn-warning btn-sm" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
    {
      name: "Product Name", selector: row => row.productname, sortable: true, width: `${calculateColumnWidth(productMaster, 'productname')}px`
    },
    {
      name: "Product Group", selector: row => row.productgroup, width: `${calculateColumnWidth(productMaster, 'productgroup')}px`
    },
    {
      name: "Product Family", selector: row => row.productfamily, width: `${calculateColumnWidth(productMaster, 'productfamily')}px`
    },
    {
      name: "Line Lead",
      selector: row => row.lineLead
        ? row.lineLead.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'lineLead')}px`
    },
    {
      name: "Product Engineer",
      selector: row => row.productEngineer
        ? row.productEngineer.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'productEngineer')}px`
    },
    {
      name: "status", selector: row => row.recordstatus, width: `${calculateColumnWidth(productMaster, 'recordstatus')}px`
    },

  ];


  const uploadColumn = [
    {
      name: "Product Name",
      selector: row => row.productname,
      sortable: true,
      width: `${calculateColumnWidth(productMaster, 'productname')}px`,
    },
    {
      name: "Product Group", selector: row => row.productgroup, width: `${calculateColumnWidth(productMaster, 'productgroup')}px`
    },
    {
      name: "Product Family", selector: row => row.productfamily, width: `${calculateColumnWidth(productMaster, 'productfamily')}px`
    },
    {
      name: "Status", selector: row => row.recordstatus, width: `${calculateColumnWidth(productMaster, 'recordstatus')}px`
    },
    {
      name: "Line Lead",
      selector: row => row.lineLead
        ? row.lineLead.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'lineLead')}px`

    },
    {
      name: "Product Engineer",
      selector: row => row.productEngineer
        ? row.productEngineer.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'productEngineer')}px`


    }
  ]

  //filterdata fomr productname 
  const filteredData = productMaster.length > 0
    ? productMaster.filter(row =>
      Object.values(row).some(value =>
        typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
      )
    )
    : [{
      productname: "",
      productgroup: "",
      productfamily: "",
      lineLead: "",
      productEngineer: "",
      recordstatus: ""
    }];


  const exportToExcel = () => {
    setLoading(true);

    downloadProduct()
      .then((response) => {

        console.log("response", response)
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "products.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error("Download failed:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const formClear = () => {
    setFormData({ productname: '', productgroup: '', productfamily: '', createdBy: '', lineLead: '', productEngineer: '', status: '' });
    setExcelUploadData([]); // Keep only this line for clearing excel data
    setHandleSubmitButton(true);
    setHandleUpdateButton(false);
    setHandleUploadButton(false);
    setShowUploadTable(false);  // Hide upload table
    setShowProductTable(true);  // Show product table
    setFileInputKey(Date.now()); // Change key to force re-render
    setSelectedRows([]);
    setDeletButton(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const getUserMail = () => {
    getUserMailId()
      .then((response) => {
        setUserMailData(response.data || []);
      })

  }

  const handleEdit = (row) => {
    console.log("Editing Row Data:", row);  // Debugging

    setFormData({
      id: row.id || "",
      productname: row.productname || "",
      productgroup: row.productgroup || "",
      productfamily: row.productfamily || "",
      recordstatus: row.recordstatus || "",
      lineLead: row.lineLead ? (Array.isArray(row.lineLead) ? row.lineLead : row.lineLead.split(",")) : [],
      productEngineer: row.productEngineer ? (Array.isArray(row.productEngineer) ? row.productEngineer : row.productEngineer.split(",")) : [],
    });

    setIsModalOpen(true);
    setHandleSubmitButton(false);
    setHandleUploadButton(false);
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


    if (!id) {
      setErrorMessage("Error: Product ID is missing!");
      setShowErrorPopup(true);
      return;
    }

    updateProduct(id, updatedFormData)
      .then((response) => {
        setSuccessMessage("Product Updated Successfully");
        setShowSuccessPopup(true);
        setFormData({
          productname: "",
          productgroup: "",
          productfamily: "",
          lineLead: "",
          recordstatus: "",
          productEngineer: "",
        });
        setHandleSubmitButton(true);
        setHandleUploadButton(false);
        setHandleUpdateButton(false);
        fetchProduct(page, perPage);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage("Product already exists");
            setShowErrorPopup(true);
          } else {
            setErrorMessage("Something went wrong");
            setShowErrorPopup(true);
          }
        } else {
          setErrorMessage("Network error, please try again");
          setShowErrorPopup(true);
        }
      });
  };

  const handleDownloadExcel = () => {
    // Define the header and data format
    const worksheetData = [
      ["productname", "productgroup", "productfamily", "lineLead", "productEngineer", "recordstatus"], // Headers
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

  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const exceluploadClear = () => {
    setShowProductTable(true);
    setShowUploadTable(false);
    setHandleUploadButton(false);
    setHandleSubmitButton(true);
  }
  const handleUpload = (event) => {
    setExcelUploadData([]);
    setShowProductTable(false);
    setHandleUpdateButton(false);
    setFormData({ productname: "", productgroup: "", productfamily: "", lineLead: "", productEngineer: "" });
    setSelectedRow([]);
    setDeletButton(false);

    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.startsWith("Product_Data")) {
      setErrorMessage("Invalid file. Please upload Product_Data.xlsx");
      setShowErrorPopup(true);
      event.target.value = null;
      exceluploadClear();

      return;
    }

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validate column headers first
      const sheetHeaders = jsonData[0]?.map((header) => header.toLowerCase()) || [];

      const expectedColumns = ["productname", "productgroup", "productfamily", "linelead", "productengineer", "recordstatus",];

      const isValid = expectedColumns.every((col) => sheetHeaders.includes(col));

      if (!isValid) {
        setErrorMessage("Invalid column format. Please upload a file with the correct columns");
        setShowErrorPopup(true);
        event.target.value = null;
        exceluploadClear();

        return;
      }

      // Prepare data ignoring the first row (since it's the header row).
      const parsedData = XLSX.utils.sheet_to_json(worksheet);

      if (!parsedData || parsedData.length === 0) {
        setErrorMessage("No data found in the uploaded file");
        setShowErrorPopup(true);
        event.target.value = null;
        exceluploadClear();
        return
      }
      setExcelUploadData(parsedData);
      setUploadTotalRows(parsedData.length);
      setHandleUploadButton(true);
      setHandleSubmitButton(false);
      setShowUploadTable(true);
      setShowProductTable(false);
    };

    reader.onerror = (error) => {
      console.error("File read error:", error);
    };
  };



  const [duplicateProducts, setDuplicateProducts] = useState([]);

  const handleExcelUpload = (e) => {
    e.preventDefault();

    const errors = [];
    excelUploadData.slice(1).forEach((row) => {
      if (!row.productname || row.productname.trim() === "") {
        errors.push("Product Name is required");
      }
    });

    if (errors.length > 0) {
      alert("Product Name is required");
      return;
    }

    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = excelUploadData.map(item => ({
      ...item,
      createdby,
      modifiedby,


      productEngineer: typeof item.productEngineer === "string"
        ? item.productEngineer.split(',').map(s => s.trim())
        : item.productEngineer,

      lineLead: typeof item.lineLead === "string"
        ? item.lineLead.split(',').map(s => s.trim())
        : item.lineLead,
    }));

    console.log("Final Payload for Bulk Upload:", updatedFormData);

    saveProductsBulk(updatedFormData) // Call bulk API
      .then(() => {
        setSuccessMessage("Products Uploaded Successfully");
        setShowSuccessPopup(true);
        setHandleUploadButton(false);
        setHandleSubmitButton(true);
        setShowUploadTable(false);
        fetchProduct();
        setShowProductTable(true);

      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            const errorMessage = error.response.data?.error;
            //console.log("errorMessage", errorMessage);
            setErrorMessage("errorMessage", errorMessage);
            setShowErrorPopup(true);
            const duplicateName = errorMessage?.split(": ")[1];
            const duplicateMail = errorMessage?.split(": ")[1];
            // ✅ Wrap in array
            setDuplicateProducts([duplicateName]);
            setShowUploadTable(true);
            setShowProductTable(false);
          }

          else {
            setErrorMessage("Something went wrong");
            setShowErrorPopup(true);
          }
        } else {
          setErrorMessage("Network error, please try again");
          setShowErrorPopup(true);
        }
      });
    setShowProductTable(true);
  };

  const rowHighlightStyle = [
    {
      when: row =>
        row?.productname &&
        duplicateProducts?.some(
          dup =>
            dup &&
            dup.toString().trim().toLowerCase() === row.productname.toString().trim().toLowerCase()
        ),
      style: {
        backgroundColor: '#d4edda', // Light green
      },
    },
  ];

  const onDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleCancel = () => {
    setSelectedRows([]);
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    try {
      await deleteproduct(selectedRows); // selectedRows should be an array of IDs
      setSuccessMessage("Products deleted successfully")
      setShowSuccessPopup(true);
      fetchProduct();
      setDeletButton(false);
      setHandleSubmitButton(true);
    } catch (error) {
      //console.error("Delete error:", error);
      setErrorMessage("Failed to delete products");
      setShowErrorPopup(true);
    }
  }
  return (
    <div className='productFamilyContainer'>

      <div className='productFamilyInput'>
        <div className='prodcutFamilyName'>
          <h5>Product Master</h5>
        </div>
        <div className='productUpload'>

          <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
          < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

          <button onClick={handleDownloadExcel}> Excel Download </button>
        </div>
        <div className='ProductTexfiled'>
          <TextField
            id="outlined-basic"
            label="Product Name"
            variant="outlined"
            name="productname"
            value={formData.productname}
            onChange={handleChange}

            error={Boolean(formErrors.productname)}
            helperText={formErrors.productname}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
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
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Product Family"
            variant="outlined"
            name="productfamily"
            value={formData.productfamily}
            onChange={handleChange}
            error={Boolean(formErrors.outstandingAmount)}
            helperText={formErrors.outstandingAmount}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />

          <Autocomplete
            options={["Active", "Inactive"]}
            getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
            value={formData.recordstatus || []}
            onChange={(event, newValue) => setFormData({ ...formData, recordstatus: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Status"
                variant="outlined"
                error={Boolean(formErrors.recordstatus)}
                helperText={formErrors.recordstatus}
                size="small"  // <-- Reduce height
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green", // label color when floated
                    fontWeight: 'bold'
                  }
                }}
              />
            )}
          />

          <Autocomplete
            multiple
            options={[...new Set(userMailData)]}  // ✅ Removes duplicates
            getOptionLabel={(option) => option}
            value={formData.lineLead || []}
            onChange={(event, newValue) => setFormData({ ...formData, lineLead: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Line Lead"
                variant="outlined"
                error={Boolean(formErrors.lineLead)}
                helperText={formErrors.lineLead}
                size="small"  // <-- Reduce height
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green", // label color when floated
                    fontWeight: 'bold'
                  }
                }}
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
                size="small"  // <-- Reduce height
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green", // label color when floated
                    fontWeight: 'bold'
                  }
                }}
              />
            )}
          />

        </div>

        <div className='productButton9'>
          {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
          {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
          {handleUploadButton && <button style={{ backgroundColor: 'orange' }} onClick={handleExcelUpload}>Upload</button>}
          {deletButton && <button style={{ backgroundColor: 'orange' }} onClick={onDeleteClick} >Delete</button>}
          <button onClick={formClear}>Clear</button>
        </div>
      </div>

      <div className='productFamilyTable'>
        {showProductTable && !showUploadTable && (
          <h5 className='prodcutTableName'>All product deatil</h5>
        )}
        {showUploadTable && !showProductTable && (
          <h5 className='prodcutTableName'>Upload product deatil</h5>
        )}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
          <button className="btn btn-success" onClick={exportToExcel} style={{ fontSize: '13px', backgroundColor: 'green' }}>
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

        {/* Default table */}
        {showProductTable && !showUploadTable && (

          <DataTable
            columns={columns}
            data={productMaster}
            pagination
            paginationServer
            progressPending={loading}
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            paginationComponentOptions={{
              rowsPerPageText: 'Rows per page:',
              rangeSeparatorText: 'of',
              noRowsPerPage: false,
              //selectAllRowsItem: true,
              //selectAllRowsItemText: 'All',
            }}
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="500px"
            className="react-datatable"
            customStyles={{
              headRow: {
                style: {
                  //background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                  background: "linear-gradient(to bottom, rgb(48, 59, 137), #159cab)",

                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  textAlign: "center",
                  minHeight: "50px",
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

        )}

        {/* Excel upload  */}
        {showUploadTable && !showProductTable && (
          <DataTable
            columns={uploadColumn}
            data={paginatedData}
            pagination
            paginationServer
            progressPending={loading}
            paginationTotalRows={uploadTotalRows}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 50]}
            paginationComponentOptions={{
              rowsPerPageText: 'Rows per page:',
              rangeSeparatorText: 'of',
              noRowsPerPage: false,
              //selectAllRowsItem: true,
              //selectAllRowsItemText: 'All',
            }}
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="400px"
            className="react-datatable"
            conditionalRowStyles={rowHighlightStyle}
            customStyles={{
              headRow: {
                style: {
                  background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  textAlign: "center",
                  minHeight: "50px",
                },
              },
              rows: {
                style: {
                  fontSize: "14px",
                  textAlign: "center",
                  alignItems: "center",
                  fontFamily: "Arial, Helvetica, sans-serif",
                },
              },
              cells: {
                style: {
                  padding: "5px",
                  justifyContent: "center",
                },
              },
              headCells: {
                style: {
                  display: "flex",
                  justifyContent: "center",
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
                  justifyContent: "flex-end",
                  alignItems: "center",
                },
              },
            }}
          />
        )}
      </div>
      <CustomDialog
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success"
        message={successMessage}
        color="primary"
      />
      <CustomDialog
        open={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        message={errorMessage}
        color="secondary"
      />
      <CustomDialog
        open={confirmDelete}
        onClose={handleCancel}
        onConfirm={handleDelete}
        title="Confirm"
        message="Are you sure you want to delete this?"
        color="primary"
      />    
      
      </div>
  )
}

export default ProductFamilyMaster