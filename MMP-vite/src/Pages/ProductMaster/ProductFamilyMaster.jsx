import React, { useRef, useEffect, useState } from 'react'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel } from "react-icons/fa";
import "../../components/Com_Component/COM_Css.css";
import { FaEdit } from "react-icons/fa";
import './ProductMaster.css'
import { deleteproduct, downloadProduct, downloadSearchProduct, getProductMasterData, getUserMailId, saveProductMaster, saveProductsBulk, updateProduct } from '../../Services/Services';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

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
    let isValid = true;
    if (!formData.productname) {
      errors.productname = "Please Enter Product Name";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  useEffect(() => {
    fetchProduct(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch]);

  useEffect(() => {
    getUserMail();
  }, []);  // Runs only once

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(searchText); // Wait 500ms after typing
    }, 500);
    return () => clearTimeout(delay);
  }, [searchText]);


  const handleSubmit = async () => {
    if (!valiDate()) return;

    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";
    const updatedFormData = { ...formData, createdby, modifiedby };

    try {
      const response = await saveProductMaster(updatedFormData);
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

      // Refresh table
      fetchProduct(1, perPage); // reset to first page
      setPage(1);
    } catch (error) {
      if (error.response) {
        const message =
          error.response.status === 409
            ? "Product already exists"
            : "Something went wrong";
        setErrorMessage(message);
      } else {
        setErrorMessage("Network error, please try again");
      }
      setShowErrorPopup(true);
    }
  };

  //FetchAllproduct
  const fetchProduct = (page = 1, size = 10, search = "") => {
    setLoading(true);
    getProductMasterData(page - 1, size, search) // Pass as separate arguments
      .then((response) => {
        setProductMaster(response.data.content || []);
        setTotalRows(response.data.totalElements || 0);
      })
      .catch((error) => {
        setErrorMessage("Error fetching data");
        setShowErrorPopup(true);
      })
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
      setSelectedRows(productMaster.map((row) => row.id));
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

  const handleRowSelect = (rowKey) => {
    setHandleUpdateButton(false);
    setFormData({ productname: "", productgroup: "", productfamily: "", lineLead: "", productEngineer: "" });
    setHandleSubmitButton(false);
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowKey);
      const updatedRows = isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect row
        : [...prevSelectedRows, rowKey]; // Select row
      if (updatedRows.length === 0) {
        setDeletButton(false);
        setHandleSubmitButton(true);
      } else {
        setDeletButton(true);
        setHandleSubmitButton(false);
      }
      return updatedRows;
    });
  };

  const calculateColumnWidth = (data, key, minWidth = 220, maxWidth = 220) => {
    if (!data || data.length === 0) return minWidth;
    const maxLength = Math.max(...data.map(row => (row[key] ? row[key].toString().length : 0)));
    const width = maxLength * 8;
    return Math.min(Math.max(width, minWidth), maxWidth);
  };

  const columns = [
    {
      name: (
        <div style={{ textAlign: 'center', }}>
          <label> Select All</label>
          <br />
          <input type="checkbox" onChange={handleSelectAll}
            checked={selectedRows.length === productMaster.length && productMaster.length > 0}
          />
        </div>
      ),
      cell: (row) => (
        <div style={{ paddingLeft: '23px', width: '100%' }}>
          <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)}
          />
        </div>
      ),
      width: "97px",
      // center: true, 
    }
    ,
    {
      name: "Edit",
      selector: row => (
        <button className="edit-button" onClick={() => handleEdit(row)}> <FaEdit size={14} /></button>), width: "60px",
    }
    , { name: "Product Name", selector: row => row.productname, width: "149px", }
    ,
    {
      name: "Product Group", selector: row => row.productgroup, width: "149px",
    },
    {
      name: "Product Family", selector: row => row.productfamily, width: "159px",
    },
    {
      name: "Line Lead",
      selector: row => row.lineLead
        ? row.lineLead.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'lineLead')}`,
    },
    {
      name: "Product Engineer",
      selector: row => row.productEngineer
        ? row.productEngineer.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'productEngineer')}`,
    },
    {
      name: "Status", selector: row => row.recordstatus, width: "199px",
    },
  ];

  const uploadColumn = [
    {
      name: "Product Name",
      selector: row => row.productname,
      sortable: true,
      width: `${calculateColumnWidth(productMaster, 'productname')}px`,
      style: { paddingLeft: '20px' }
    },
    {
      name: "Product Group",
      selector: row => row.productgroup,
      style: { paddingLeft: '20px' }
    }
    ,
    {
      name: "Product Family", selector: row => row.productfamily, width: `${calculateColumnWidth(productMaster, 'productfamily')}px`, style: { paddingLeft: '20px' }
    },
    {
      name: "Status", selector: row => row.recordstatus, width: `${calculateColumnWidth(productMaster, 'recordstatus')}px`, style: { paddingLeft: '20px' }
    },
    {
      name: "Line Lead",
      selector: row => row.lineLead
        ? row.lineLead.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'lineLead')}px`,
      style: { paddingLeft: '20px' }
    },
    {
      name: "Product Engineer",
      selector: row => row.productEngineer
        ? row.productEngineer.split(",").map(email => <div key={email}>{email}</div>)
        : "", width: `${calculateColumnWidth(productMaster, 'productEngineer')}px`,
      style: { paddingLeft: '20px' }
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

  const exportToExcel = (search = "") => {
    console.log("searchTeaxt", search)
    if (search && search.trim() !== "") {
      setLoading(true);
      downloadSearchProduct(search) // <- pass search here
        .then((response) => {
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
    } else {
      setLoading(true);
      downloadProduct()
        .then((response) => {
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
    }
  };

  const formClear = () => {
    setFormData({ productname: '', productgroup: '', productfamily: '', createdBy: '', lineLead: '', productEngineer: '', status: '' });
    setExcelUploadData([]);
    setHandleSubmitButton(true);
    setHandleUpdateButton(false);
    setHandleUploadButton(false);
    setShowUploadTable(false);
    setFormErrors({});
    setShowProductTable(true);
    setFileInputKey(Date.now());
    setSelectedRows([]);
    setDeletButton(false);
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
    console.log("Editing Row Data:", row);
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
    e.preventDefault();
    if (!valiDate()) return;
    setLoading(true);
    const modifiedby = sessionStorage.getItem("userName") || "System";
    const updatedFormData = {
      ...formData,
      id,
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
        setPage(1);          // Set page to 1
        fetchData(1);
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage(error.response.data.message);
            setShowErrorPopup(true);
          } else {
            setErrorMessage("Something went wrong");
            setShowErrorPopup(true);
          }
        }
      }).finally(() => {
        setLoading(false);
      });
  };

  const handleDownloadExcel = () => {
    const worksheetData = [
      ["productname", "productgroup", "productfamily", "lineLead", "productEngineer", "recordstatus"], // Headers
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");
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
      setErrorMessage("File read error:", error);
      setShowErrorPopup(true);
      // console.error("File read error:", error);
    };
  };

  const [duplicateProducts, setDuplicateProducts] = useState([]);
  const handleExcelUpload = (e) => {
    e.preventDefault();
    const errors = [];
    excelUploadData.slice(1).forEach((row) => {
      if (!row.productname || row.productname.trim() === "") {
        setErrorMessage("Product Name is required");
        setShowErrorPopup(true);
        // errors.push("Product Name is required");
      }
    });

    if (errors.length > 0) {
      setErrorMessage("Product Name is required");
      setShowErrorPopup(true);
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
    setLoading(true);
    // console.log("Final Payload for Bulk Upload:", updatedFormData);
    saveProductsBulk(updatedFormData) // Call bulk API
      .then(() => {
        setSuccessMessage("Products Uploaded Successfully");
        setShowSuccessPopup(true);
        setHandleUploadButton(false);
        setHandleSubmitButton(true);
        setExcelUploadData([]);
        setShowUploadTable(false);
        fetchProduct();
        setShowProductTable(true);
      })
      .catch((error) => {
        // Extract error message from response
        const message = error.response?.data?.error || "Something went wrong";

        setErrorMessage(message); // Correctly set error message
        setShowErrorPopup(true);

        // Extract duplicate product name if present
        const duplicateName = message.includes(":") ? message.split(": ")[1] : null;

        if (duplicateName) {
          setDuplicateProducts([duplicateName]);
        } else {
          setDuplicateProducts([]);
        }

        setShowUploadTable(true);
        setShowProductTable(false);
      }).finally(() => {
        setLoading(false);
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
    setDeletButton(false)
    setHandleSubmitButton(true)
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteproduct(selectedRows); // selectedRows should be an array of IDs
      setSuccessMessage("Products deleted successfully")
      setShowSuccessPopup(true);
      fetchProduct();
      setDeletButton(false);
      setHandleSubmitButton(true);
      setConfirmDelete(false);
    } catch (error) {
      setErrorMessage("Failed to delete products");
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className='COMCssContainer'>
      <div className='ComCssInput'>
        <div className='ComCssFiledName' >
          <p >Product Master</p>
        </div>
        <div className='ComCssUpload'>
          <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
          < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
          <button onClick={handleDownloadExcel}> Excel Format Download </button>
        </div>
        <div className='ProductTexfiled'>
          <ThemeProvider theme={TextFiledTheme}>

            <TextField
              id="outlined-basic"
              label="Product Name"
              variant="outlined"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              className='ProductTexfiled-textfield '
              error={Boolean(formErrors.productname)}
              helperText={formErrors.productname}
            />
            <TextField
              id="outlined-basic"
              label="Product Group"
              variant="outlined"
              name="productgroup"
              value={formData.productgroup}
              onChange={handleChange}
              className='ProductTexfiled-textfield '
              error={Boolean(formErrors.outstandingAmount)}
              helperText={formErrors.outstandingAmount}
            />
            <TextField
              id="outlined-basic"
              label="Product Family"
              variant="outlined"
              name="productfamily"
              value={formData.productfamily}
              onChange={handleChange}
              className='ProductTexfiled-textfield '
              error={Boolean(formErrors.outstandingAmount)}
              helperText={formErrors.outstandingAmount}
            />
            <Autocomplete
              options={["Active", "Inactive"]}
              className='ProductTexfiled-textfield '
              getOptionLabel={(option) => (typeof option === "string" ? option : "")}
              value={formData.recordstatus || []}
              onChange={(event, newValue) => setFormData({ ...formData, recordstatus: newValue || [] })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Status"
                  variant="outlined"
                  error={Boolean(formErrors.recordstatus)}
                  helperText={formErrors.recordstatus}

                />
              )}
            />
            <Autocomplete
              multiple
              options={[...new Set(userMailData)]}
              getOptionLabel={(option) => option}
              value={formData.lineLead || []}
              className='ProductTexfiled-textfield '
              onChange={(event, newValue) => setFormData({ ...formData, lineLead: newValue || [] })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Line Lead"
                  variant="outlined"
                  error={Boolean(formErrors.lineLead)}
                  helperText={formErrors.lineLead}
                />
              )}
            />
            <Autocomplete
              multiple
              options={[...new Set(userMailData)]}
              getOptionLabel={(option) => option}
              value={formData.productEngineer || []}
              className='ProductTexfiled-textfield '
              onChange={(event, newValue) => setFormData({ ...formData, productEngineer: newValue || [] })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Engineer"
                  variant="outlined"
                  error={Boolean(formErrors.productEngineer)}
                  helperText={formErrors.productEngineer}
                />
              )}
            />
          </ThemeProvider>

        </div>
        <div className='ComCssButton9'>
          {handleSubmitButton && <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>}
          {handleUpdateButton && <button className='ComCssUpdateButton' onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
          {handleUploadButton && <button className='ComCssExcelUploadButton' onClick={handleExcelUpload}>Upload</button>}
          {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick} >Delete</button>}
          <button className='ComCssClearButton' onClick={formClear}>Clear</button>
        </div>
      </div>

      <div className='ComCssTable'>
        {showProductTable && !showUploadTable && (
          <h5 className='ComCssTableName'>Product Details ✅</h5>
        )}
        {showUploadTable && !showProductTable && (
          <h5 className='ComCssTableName'>Upload product Detail</h5>
        )}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
          <button className="btn btn-success" onClick={() => exportToExcel(searchText)} >
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

        {showProductTable && !showUploadTable && (
          <>
            <LoadingOverlay loading={loading} />
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
            />
          </>
        )}

        {showUploadTable && !showProductTable && (
          <>
            <LoadingOverlay loading={loading} />
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
                    // background: "linear-gradient(to bottom, rgb(159, 13, 162),rgb(82, 179, 187))",
                    background: "linear-gradient(to right, #701964, #179999)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "14px",
                    textAlign: "left",
                    minHeight: "50px",
                  },
                },
                headCells: {
                  style: {
                    textAlign: "left",
                    justifyContent: "flex-start",
                    fontWeight: "bold",
                  },
                },
                rows: {
                  style: {
                    fontSize: "14px",
                    textAlign: "left",
                    alignItems: "flex-start",
                    //  fontFamily: "Arial, Helvetica, sans-serif",
                    fontFamily: `'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif`,
                  },
                },
                cells: {
                  style: {
                    padding: "5px",
                    textAlign: "left",
                    justifyContent: "flex-start",
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
          </>
        )}
      </div>
      <CustomDialog
        open={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Success"
        message={successMessage}
        severity="success"
        color="primary"
      />
      <CustomDialog
        open={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="Error"
        message={errorMessage}
        severity="error"
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