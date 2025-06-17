import React, { useState, useMemo, useRef, useEffect } from 'react'
import './RcMainStore.css'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import { deleteRc, getRcmainMaster, getRcmainMasterFind, saveBulkRcMain, saveMainMaterial, updateRcSrore } from '../ServicesComponent/Services';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { FaEdit } from "react-icons/fa";
import CustomDialog from "../COM_Component/CustomDialog";
const RcMainStore = () => {
  const [formErrors, setFormErrors] = useState({});
  const [handleSubmitButton, setHandleSubmitButton] = useState(true);
  const [handleUpdateButton, setHandleUpdateButton] = useState(false);
  const [handleUploadButton, setHandleUploadButton] = useState(false);
  const [excelUploadData, setExcelUploadData] = useState([]);
  const [showUploadTable, setShowUploadTable] = useState(false);
  const [showRcTable, setShowRcTable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rcStoreData, setRcStoreData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredDataRc, setFilteredDataRc] = useState([]);
  //const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [deletButton, setDeletButton] = useState();
  const [duplicateProducts, setDuplicateProducts] = useState([]);
  const [size, setSize] = useState(10); // Your size control
      const [confirmDelete, setConfirmDelete] = useState(false);
  
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  const debouncedSearch = useDebounce(searchText, 500); // delay in ms
  const formRef = useRef(null);


  //const rcStoreDatar = setRcStoreData.flatMap(row => row.productEngineer || [])

  const [formData, setFormData] = useState({
    partcode: '',
    partdescription: '',
    rohsstatus: '',
    racklocation: '',
    msdstatus: '',
    technology: '',
    unitprice: '',
    createdby: '',
    modifiedby: '',
    quantity: '',
    UOM: '',
    AFO: '',
    ComponentUsage: '',
    TYC: '',
    TLT: '',
    MOQ: '',
    TRQty: '',
    POSLT: '',
    BG: '',
    expdateapplicable: '',
    shelflife: 0
  })
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formClear = () => {
    setFormData({
      partcode: '',
      partdescription: '',
      rohsstatus: '',
      racklocation: '',
      msdstatus: '',
      technology: '',
      unitprice: '',
      createdby: '',
      modifiedby: '',
      quantity: '',
      UOM: '',
      AFO: '',
      ComponentUsage: '',
      TYC: '',
      TLT: '',
      MOQ: '',
      TRQty: '',
      POSLT: '',
      BG: '',
      expdateapplicable: '',
      shelflife: 0
    });
    setFileInputKey(Date.now()); // Change key to force re-render
    setExcelUploadData([]);
    setHandleSubmitButton(true);
    setHandleUpdateButton(false);
    setHandleUploadButton(false);
    setShowUploadTable(false);
    setShowRcTable(true);
    setDeletButton(false)
    setSelectedRows([]);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valiDate()) return;
    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = {
      ...formData,
      createdby,
      modifiedby,
    };

    console.log("updatedFormData", updatedFormData);

    saveMainMaterial(updatedFormData)
      .then((response) => {
        fetchMainMaster(page, perPage);
        setShowSuccessPopup(true);
        setSuccessMessage("Masterdata Added Successfully")
        formClear(); // ✅ clear form only once
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setShowErrorPopup(true)
            setErrorMessage("Product already exists")
          } else {
            setErrorMessage("Something went wrong");
          setShowErrorPopup(true);
          }
        }
      });
  };

  const valiDate = () => {
    const errors = {};
    let isValid = true; // Assume valid initially

    if (!formData.partcode) {
      errors.partcode = "Please Enter partcode";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid; // Now it correctly returns false if any field is empty
  };

  const handleDownloadExcel = () => {
    // Define the header and data format
    const worksheetData = [
      ["partcode", "partdescription", "rohsstatus", "racklocation", "msdstatus", "technology", "unitprice", "quantity",
        "UOM", "AFO", "ComponentUsage", "TYC", "TLT", "MOQ", "TRQty", "POSLT", "BG", "expdateapplicable", "shelflife"]
    ];
    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

    // Create an Excel file and trigger download
    XLSX.writeFile(workbook, "RcMainMaster.xlsx");
  };

  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const exceluploadClear = () => {
        setShowRcTable(true);
        setShowUploadTable(false);
        setHandleUploadButton(false);
        setHandleSubmitButton(true);
    }

  const handleUpload = (event) => {
      setExcelUploadData([]);
      setShowRcTable(false);
      setHandleUpdateButton(false);
setFormData({partcode: '',partdescription: '',rohsstatus: '',racklocation: '',msdstatus: '',technology: '',unitprice: '',createdby: '',
      modifiedby: '', quantity: '',UOM: '',AFO: '',ComponentUsage: '',TYC: '',TLT: '',MOQ: '',TRQty: '',POSLT: '',BG: '',expdateapplicable: '',shelflife: 0
    });      setSelectedRows([]);
      setDeletButton(false);
  
      const file = event.target.files[0];
      if (!file) return;
  
      if (!file.name.startsWith("RcMainMaster")) {

        setErrorMessage("Invalid file. Please upload RcMainMaster.xlsx");
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
  
        const expectedColumns =  ["partcode", "partdescription", "rohsstatus", "racklocation", "msdstatus", "technology", "unitprice", "quantity",
        "UOM", "AFO", "ComponentUsage", "TYC", "TLT", "MOQ", "TRQty", "POSLT", "BG", "expdateapplicable", "shelflife"];
  
        const isValid = expectedColumns.every((col) => sheetHeaders.includes(col));
  
        // Prepare data ignoring the first row (since it's the header row).
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
  
        if (!parsedData || parsedData.length === 0) {
          setErrorMessage("NNo data found in the uploaded file");
          setShowErrorPopup(true);
          event.target.value = null;
          exceluploadClear();
          return
        }
        setExcelUploadData(parsedData);
        setTotalRows(parsedData.length);
        setHandleUploadButton(true);
        setHandleSubmitButton(false);
        setShowUploadTable(true);
        setShowProductTable(false);
      };
  
      reader.onerror = (error) => {
        console.error("File read error:", error);
      };
    };


  const calculateColumnWidth = (data, key, charWrap = 19, charWidth = 8, minWidth = 150, maxWidth = 318) => {
    if (!Array.isArray(data) || data.length === 0) return minWidth;

    const maxLines = Math.max(
      ...data.map(row => {
        const text = row[key]?.toString() || "";
        return Math.ceil(text.length / charWrap); // count wrapped lines
      })
    );

    const width = charWrap * charWidth;
    return Math.min(Math.max(width, minWidth), maxWidth);
  };



  //const uploadColumn = [
  const uploadColumn = useMemo(() => {
    console.log("Recalculating column widths...");
    return [

      {
        name: "Partcode", selector: row => row.partcode, sortable: true, width: `${calculateColumnWidth(excelUploadData, 'partcode')}px`
      },
      {
        name: "Partdescription",
        selector: row => row.partdescription, wrap: true,

        width: `${calculateColumnWidth(excelUploadData, 'partdescription')}px`
      },
      {
        name: "Rohs-status", selector: row => row.rohsstatus, width: `${calculateColumnWidth(excelUploadData, 'rohsstatus')}px`
      },
      {
        name: "Rack Location",
        selector: row => row.racklocation
          ? row.racklocation.split(",").map(email => <div key={email}>{email}</div>)
          : "", width: `${calculateColumnWidth(excelUploadData, 'racklocation')}px`

      },
      {
        name: "Msd Status", selector: row => row.msdstatus, width: `${calculateColumnWidth(excelUploadData, 'msdstatus')}px`
      },
      {
        name: "Technology", selector: row => row.technology, width: `${calculateColumnWidth(excelUploadData, 'technology')}px`
      },
      {
        name: "UnitPrice", selector: row => row.unitprice, width: `${calculateColumnWidth(excelUploadData, 'unitprice')}px`
      },
      {
        name: "Quantity", selector: row => row.quantity, width: `${calculateColumnWidth(excelUploadData, 'quantity')}px`
      },
      {
        name: "UOM", selector: row => row.UOM, width: `${calculateColumnWidth(excelUploadData, 'UOM')}px`
      },
      {
        name: (<div>Active For <br /> Componant</div>), selector: row => row.AFO, width: `${calculateColumnWidth(excelUploadData, 'AFO')}px`
      },
      {
        name: "ComponentUsage", selector: row => row.ComponentUsage, width: `${calculateColumnWidth(excelUploadData, 'ComponentUsage')}px`
      },
      {
        name: (<div>Type Of <br /> Component</div>), selector: row => row.TYC, width: `${calculateColumnWidth(excelUploadData, 'TYC')}px`
      },
      {
        name: "TLT", selector: row => row.TLT, width: `${calculateColumnWidth(excelUploadData, 'TLT')}px`
      },
      {
        name: "MOQ", selector: row => row.MOQ, width: `${calculateColumnWidth(excelUploadData, 'MOQ')}px`
      },
      {
        name: (<div>Threshold <br />Request Qty</div>), selector: row => row.TRQty, width: `${calculateColumnWidth(excelUploadData, 'TRQty')}px`
      },
      {
        name: (
          <div>
            Planned Ordering<br />Stock Lead Time
          </div>
        ), selector: row => row.POSLT, width: `${calculateColumnWidth(excelUploadData, 'POSLT')}px`
      },
      {
        name: "BG", selector: row => row.BG, width: `${calculateColumnWidth(excelUploadData, 'BG')}px`
      },
      {
        name: (<div>Expdate <br />Applicable</div>), selector: row => row.expdateapplicable, width: `${calculateColumnWidth(excelUploadData, 'expdateapplicable')}px`
      },
      {
        name: "Shelflife", selector: row => row.shelflife, width: `${calculateColumnWidth(excelUploadData, 'shelflife')}px`
      }
    ]
  }, [excelUploadData]);

  //DeleteAll
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(rcStoreData.map((row) => row.id)); // ✅ Ensure unique selection key
      setDeletButton(true);
      setHandleSubmitButton(false);
      setHandleUpdateButton(false);
      setFormData({partcode: '',partdescription: '',rohsstatus: '',racklocation: '',msdstatus: '',technology: '',unitprice: '',createdby: '',
      modifiedby: '', quantity: '',UOM: '',AFO: '',ComponentUsage: '',TYC: '',TLT: '',MOQ: '',TRQty: '',POSLT: '',BG: '',expdateapplicable: '',shelflife: 0
    });
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
                setHandleUpdateButton(false);

    setFormData({partcode: '',partdescription: '',rohsstatus: '',racklocation: '',msdstatus: '',technology: '',unitprice: '',createdby: '',
      modifiedby: '', quantity: '',UOM: '',AFO: '',ComponentUsage: '',TYC: '',TLT: '',MOQ: '',TRQty: '',POSLT: '',BG: '',expdateapplicable: '',shelflife: 0
    });
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowKey);

      // Update selected rows
      const updatedRows = isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect
        : [...prevSelectedRows, rowKey]; // Select row

      // Conditional button states based on updated rows
      if (updatedRows.length === 0) {
        setDeletButton(false); // Disable delete button if no rows are selected
        setHandleSubmitButton(true); // Enable submit button
        setHandleUpdateButton(false);
      } else {
        setDeletButton(true); // Enable delete button if rows are selected
        setHandleSubmitButton(false); // Disable submit button
      }

      return updatedRows;
    });
  };

  const column = [

    {
      name: (
        <div style={{ textAlign: "center" }}>
          <label>Delete All</label>
          <br />

          <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === rcStoreData.length && rcStoreData.length > 0} />
        </div>
      ),
      cell: (row) => (
        <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)} />
      ),
      width: "130px",
    },
    { name: "Edit", selector: row => (<button className="btn btn-warning btn-sm" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
    ,
    {
      name: "Partcode",
      selector: row => row.partcode,
      sortable: true,
      width: `${calculateColumnWidth(rcStoreData, 'partcode')}px`
    },
    {
      name: "Partdescription",
      selector: row => row.partdescription,
      wrap: true,
      width: `${calculateColumnWidth(rcStoreData, 'partdescription')}px`
    },
    {
      name: "Rohs-status",
      selector: row => row.rohsstatus,
      width: `${calculateColumnWidth(rcStoreData, 'rohsstatus')}px`
    },
    {
      name: "Rack Location",
      selector: row =>
        row.racklocation
          ? row.racklocation.split(",").map(item => <div key={item}>{item}</div>)
          : "",
      width: `${calculateColumnWidth(rcStoreData, 'racklocation')}px`
    },
    {
      name: "Msd Status",
      selector: row => row.msdstatus,
      width: `${calculateColumnWidth(rcStoreData, 'msdstatus')}px`
    },
    {
      name: "Technology",
      selector: row => row.technology,
      width: `${calculateColumnWidth(rcStoreData, 'technology')}px`
    },
    {
      name: "UnitPrice",
      selector: row => row.unitprice,
      width: `${calculateColumnWidth(rcStoreData, 'unitprice')}px`
    },
    {
      name: "Quantity",
      selector: row => row.quantity,
      width: `${calculateColumnWidth(rcStoreData, 'quantity')}px`
    },
    {
      name: "UOM",
      selector: row => row.uom,
      width: `${calculateColumnWidth(rcStoreData, 'UOM')}px`
    },
    {
      name: (<div>Active For <br /> Componant</div>),
      selector: row => row.afo,
      width: `${calculateColumnWidth(rcStoreData, 'AFO')}px`
    },
    {
      name: "ComponentUsage",
      selector: row => row.componentUsage,
      width: `${calculateColumnWidth(rcStoreData, 'ComponentUsage')}px`
    },
    {
      name: (<div>Type Of <br /> Component</div>),
      selector: row => row.tyc,
      width: `${calculateColumnWidth(rcStoreData, 'TYC')}px`
    },
    {
      name: "TLT",
      selector: row => row.tlt,
      width: `${calculateColumnWidth(rcStoreData, 'TLT')}px`
    },
    {
      name: "MOQ",
      selector: row => row.moq,
      width: `${calculateColumnWidth(rcStoreData, 'MOQ')}px`
    },
    {
      name: (<div>Threshold <br />Request Qty</div>),
      selector: row => row.trqty,
      width: `${calculateColumnWidth(rcStoreData, 'TRQty')}px`
    },
    {
      name: (<div>Planned Ordering<br />Stock Lead Time</div>),
      selector: row => row.poslt,
      width: `${calculateColumnWidth(rcStoreData, 'POSLT')}px`
    },
    {
      name: "BG",
      selector: row => row.bg,
      width: `${calculateColumnWidth(rcStoreData, 'BG')}px`
    },
    {
      name: (<div>Expdate <br />Applicable</div>),
      selector: row => row.expdateapplicable,
      width: `${calculateColumnWidth(rcStoreData, 'expdateapplicable')}px`
    },
    {
      name: "Shelflife",
      selector: row => row.shelflife,
      width: `${calculateColumnWidth(rcStoreData, 'shelflife')}px`
    }

  ]


  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  }


  const handlePageChange = (newPage) => {
    setPage(newPage);
  };




  const excelUpload = (e) => {
    e.preventDefault();

    const errors = [];
    excelUploadData.slice(1).forEach((row) => {
      if (!row.partcode || row.partcode.trim() === "") {
        errors.push("partcode  is required");
      }
    });

    if (errors.length > 0) {
      setErrorMessage("partcode is required");
          setShowErrorPopup(true);
      return;
    }

    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = excelUploadData.map(item => ({
      ...item,
      createdby,
      modifiedby,
    }))
    console.log("Final Payload for Bulk Upload:", updatedFormData);

    saveBulkRcMain(updatedFormData)
      .then(() => {
        setSuccessMessage("Master data added successfully."); // Set dynamic message
        setShowSuccessPopup(true);  // Show popup
        setShowUploadTable(false);

      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            const errorMessage = error.response.data?.error;
            console.log("errorMessage", errorMessage);

            const duplicateName = errorMessage?.split(": ")[1];
            const duplicateMail = errorMessage?.split(": ")[1];
            setErrorMessage(errorMessage); // Set error message for dialog
            setShowErrorPopup(true); // Show error popup
            // ✅ Wrap in array
            setDuplicateProducts([duplicateName]);

            setShowUploadTable(true);
            // setShowProductTable(false);
          }

          else {
            setErrorMessage("Something went wrong");
          setShowErrorPopup(true);
          }
        } else {
setErrorMessage("Network error, please try again");
          setShowErrorPopup(true);        }
      });

  }

  const rowHighlightStyle = [
    {
      when: row =>
        row?.partcode &&
        duplicateProducts?.some(
          dup =>
            dup &&
            dup.toString().trim().toLowerCase() === row.partcode.toString().trim().toLowerCase()
        ),
      style: {
        backgroundColor: '#d4edda', // Light green
      },
    },
  ];

  const filteredData = rcStoreData.length > 0
    ? rcStoreData.filter(row =>
      Object.values(row).some(value =>
        typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
      )
    )
    : [{
      partcode: "", partdescription: "", rohsstatus: "", racklocation: "", msdstatus: "", technology: "",
      unitprice: "", createdby: "", modifiedby: "", quantity: "", UOM: "", AFO: "", ComponentUsage: "",
      TYC: "", TLT: "", MOQ: "", TRQty: "", POSLT: "", BG: "", expdateapplicable: "", shelflife: "",

    }];
 

  const fetchMainMaster = (page = 1, size = 10) => {
    setLoading(true); // ✅ Start loading before fetch
    getRcmainMaster(page - 1, size)
      .then((response) => {
        const data = response?.data || {};
        setRcStoreData(data.content || []);
        setTotalRows(data.totalElements || 0);
        console.log("data.totalElements", data.totalElements)
        console.log("data.content", data.content)

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false); // ✅ Always stop loading
      });
  };


  const fetchFind = (page = 1, size = 10, search = "") => {
    setLoading(true); // ✅ Start loading before fetch
    getRcmainMasterFind(page - 1, size, search)
      .then((response) => {
        const data = response?.data || {};
        setRcStoreData(data.content || []);
        setTotalRows(data.totalElements || 0);
        console.log("findFetch", data.totalElements)
        console.log("data.content", data.content)

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false); // ✅ Always stop loading
      });
  };




  useEffect(() => {
    fetchData(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch]);

  const fetchData = (page = 1, size = 10, search = "") => {
    if (search && search.trim() !== "") {
      fetchFind(page, size, search);    // Call search API
    } else {
      fetchMainMaster(page, perPage);      // Call default API
    }
  };



  
   const onDeleteClick = () => {
        setConfirmDelete(true);
    };

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
    };
  const handleDelete = async () => {
    try {
      await deleteRc(selectedRows); // API call
      setSuccessMessage("Data successfully deleted");
      setShowSuccessPopup(true);
      setSelectedRows([]);
      setDeletButton(false);
      setHandleSubmitButton(true);

      // 👇 Refresh the current page after deletion
      fetchMainMaster(page, perPage);

    } catch (error) {
      console.error("Delete error:", error);
      setErrorMessage("Delete error: " + (error.message || "Something went wrong"));
      setShowErrorPopup(true);
    }
  };

  const handleEdit = (row) => {
    setFormData(row); // or whatever sets the data
    formRef.current?.scrollIntoView({ behavior: "smooth" });
    setFormData({
      id: row.id || "",
      partcode: row.partcode || "",
      partdescription: row.partdescription || "",
      rohsstatus: row.rohsstatus || "", racklocation: row.racklocation || "",
      msdstatus: row.msdstatus || "", technology: row.technology || "",
      quantity: row.quantity || "", UOM: row.UOM || "",
      AFO: row.AFO || "", ComponentUsage: row.ComponentUsage || "",
      TYC: row.TYC || "", TLT: row.TLT || "", MOQ: row.MOQ || "",
      TRQty: row.TRQty || "", POSLT: row.POSLT || "",
      BG: row.BG || "", expdateapplicable: row.expdateapplicable || "",
      shelflife: row.shelflife || "",

    });
    setHandleSubmitButton(false);
    setHandleUpdateButton(true);
    setHandleUploadButton(false);
    setDeletButton(false);
    setSelectedRows([]);
  }


  const handleUpdate = (e, id) => {
    e.preventDefault();
    if (!valiDate()) return;
    setLoading(true);
    const modifiedby = sessionStorage.getItem("userName") || "System";
    const updateFormData = {
      ...formData,
      id,
      modifiedby
    }
    updateRcSrore(id, updateFormData)
      .then((response) => {
        setSuccessMessage("Updated sucessfully");
        setShowSuccessPopup(true);
        formClear();
        setHandleUpdateButton(false);
        setHandleSubmitButton(true);
        fetchMainMaster().then(() => {
          setPage(0); // 👈 Reset pagination AFTER data is fetched
        });        //setPage(1); 

      }).catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage("Already exists");
            setShowErrorPopup(true);
          } else {
            setErrorMessage("Something went wrong");
            setShowErrorPopup(true);
          }
        } else {
          setErrorMessage("Network error, please try again");
          setShowErrorPopup(true);
        }
      }).finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className='RcContainer'>
      <div className='RcStoreInput'>
        <div className='RcStoreFiledName'>
          <h5>MainMaterial Master </h5>
        </div>
        <div className='productUpload'>

          <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
          < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

          <button onClick={handleDownloadExcel}> Excel Download </button>
        </div>
        <div className='RcStoreTexfiled'>
          <TextField
            id="outlined-basic"
            label="partcode"
            variant="outlined"
            name="partcode"
            value={formData.partcode}
            onChange={handleChange}
            error={Boolean(formErrors.partcode)}
            helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="part Description"
            variant="outlined"
            name="partdescription"
            value={formData.partdescription}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="UOM"
            variant="outlined"
            name="UOM"
            value={formData.UOM}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Active For Ordering"
            variant="outlined"
            name="AFO"
            value={formData.AFO}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="ComponentUsage"
            variant="outlined"
            name="ComponentUsage"
            value={formData.ComponentUsage}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"

            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Type Of Component"
            variant="outlined"
            name="TYC"
            value={formData.TYC}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Total Lead Time"
            variant="outlined"
            name="TLT"
            value={formData.TLT}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="MOQ"
            variant="outlined"
            name="MOQ"
            value={formData.MOQ}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Threshold Request Qty"
            variant="outlined"
            name="TRQty"
            value={formData.TRQty}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Planned Ordering Stock Lead Time"
            variant="outlined"
            name="POSLT"
            value={formData.POSLT}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="BG"
            variant="outlined"
            name="BG"
            value={formData.BG}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Rohs Status"
            variant="outlined"
            name="rohsstatus"
            value={formData.rohsstatus}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Msd Status"
            variant="outlined"
            name="msdstatus"
            value={formData.msdstatus}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Technology"
            variant="outlined"
            name="technology"
            value={formData.technology}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Rack Location"
            variant="outlined"
            name="racklocation"
            value={formData.racklocation}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Quantity"
            variant="outlined"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            id="outlined-basic"
            label="Unit Price"
            variant="outlined"
            name="unitprice"
            value={formData.unitprice}
            onChange={handleChange}
            //error={Boolean(formErrors.partcode)}
            //helperText={formErrors.partcode}
            //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
            size="small"

            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <Autocomplete
            options={["Yes", "No", "NotApplicable"]}
            getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
            value={formData.expdateapplicable || []}
            onChange={(event, newValue) => setFormData({ ...formData, expdateapplicable: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Expdateapplicable"
                variant="outlined"
                //error={Boolean(formErrors.recordstatus)}
                // helperText={formErrors.recordstatus}
                // sx={{ "& .MuiInputBase-root": { height: "40px" } }}
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
          {formData.expdateapplicable === 'No' && (
            <TextField
              id="shelfLife"
              label="Shelf Life"
              name="shelflife"
              type="number"
              value={formData.shelflife}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              defaultValue={0}
              variant="outlined"
              size="small"
              sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
            />
          )}
        </div>
        <div className='productButton9'>
          {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
          {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
          {handleUploadButton && <button style={{ backgroundColor: 'orange' }} onClick={excelUpload}>Upload</button>}
          {deletButton && <button style={{ backgroundColor: 'orange' }} onClick={onDeleteClick}  >Delete</button>}
          <button onClick={formClear}>Clear</button>
        </div>
      </div>

      <div className='productFamilyTable'>
        {showRcTable && !showUploadTable && (
          <h5 className='prodcutTableName'>All Master deatil</h5>
        )}
        {showUploadTable && !showRcTable && (
          <h5 className='prodcutTableName'>Upload Master deatil</h5>
        )}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
          <button className="btn btn-success" style={{ fontSize: '13px', backgroundColor: 'green' }}>
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
        {showRcTable && !showUploadTable && (


          <DataTable
            columns={column}
            data={rcStoreData}
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
              // selectAllRowsItem: true,
              // selectAllRowsItemText: 'All',
            }}
            fixedHeader    // ✅ ADD THIS LINE
            fixedHeaderScrollHeight="400px"
            highlightOnHover
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
                  textAlign: "left",
                  alignItems: "center", // Centers content vertically
                  fontFamily: "Arial, Helvetica, sans-serif",
                },
              },
              cells: {
                style: {
                  padding: "5px",  // Removed invalid negative padding
                  //textAlign: "center",
                  justifyContent: "center",  // Centers header text
                  whiteSpace: 'pre-wrap', // wrap text
                  wordBreak: 'break-word', // allow breaking words
                },
              },
              headCells: {
                style: {
                  display: "flex",
                  justifyContent: "center",  // Centers header text
                  alignItems: "left",
                  textAlign: "left",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
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

        {showUploadTable && !showRcTable && (
          <DataTable
            columns={uploadColumn}
            data={excelUploadData}
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
                  alignItems: "center", // Centers content vertically
                  fontFamily: "Arial, Helvetica, sans-serif",
                },
              },
              cells: {
                style: {
                  padding: "5px",  // Removed invalid negative padding
                  //textAlign: "center",
                  justifyContent: "center",  // Centers header text
                  whiteSpace: 'pre-wrap', // wrap text
                  wordBreak: 'break-word', // allow breaking words
                },
              },
              headCells: {
                style: {
                  display: "flex",
                  justifyContent: "center",  // Centers header text
                  alignItems: "left",
                  textAlign: "left",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
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

export default RcMainStore