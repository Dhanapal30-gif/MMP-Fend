import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import './RcMainStore.css'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, IconButton, Table, TableBody, TableCell, TableHead, TableRow  } from '@mui/material';
import { deleteRc, downloadRc, downloadSearchRc, fetchRc, getRcmainMaster, getRcmainMasterFind, saveBulkRcMain, saveMainMaterial, updateRcSrore } from '../../Services/Services';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { FaEdit } from "react-icons/fa";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { Add, Remove } from "@mui/icons-material";

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
  const [rcStore, setRcStore] = useState([]);
  const [filteredDataRc, setFilteredDataRc] = useState([]);
  //const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [deletButton, setDeletButton] = useState();
  const [duplicateProducts, setDuplicateProducts] = useState([]);
  const [size, setSize] = useState(10); // Your size control
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rackRows, setRackRows] = useState([{ racklocation: "" }]);
const [resetKey, setResetKey] = useState(0);
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
const handleLocationChange = (index, value) => {
    const updatedRows = [...rackRows];
    updatedRows[index].racklocation = value;
    setRackRows(updatedRows);
  };
  const formClear = () => {
    setFormData({
      partcode: '', partdescription: '', rohsstatus: '', racklocation: '', msdstatus: '', technology: '', unitprice: '',
      createdby: '', modifiedby: '', quantity: '', UOM: '', AFO: '', ComponentUsage: '', TYC: '', TLT: '', MOQ: '',
      TRQty: '', POSLT: '', BG: '', expdateapplicable: '', shelflife: 0
    });
      setRackRows([{ racklocation: "" }]); 

    setFormErrors("");
    setFileInputKey(Date.now());
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
      const racklocationPayload = rackRows.map(row => row.racklocation).filter(Boolean).join(',');

    const updatedFormData = {
      ...formData,
      createdby,
      modifiedby,
          racklocation: racklocationPayload,  // <- updated here

    };

    // console.log("updatedFormData", updatedFormData);
    saveMainMaterial(updatedFormData)
      .then((response) => {
        fetchMainMaster(page, perPage);
        setShowSuccessPopup(true);
        setResetKey(prev => prev + 1);  
        setPage(1);
        setSuccessMessage("Masterdata Added Successfully")
        formClear();
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
    let isValid = true;

    if (!formData.partcode) {
      errors.partcode = "Please Enter partcode";
      isValid = false;
    }
     const hasRack = rackRows.some(row => row.racklocation && row.racklocation.trim() !== "");
  if (!hasRack) {
    errors.racklocation = "Please enter at least one rack location";
    isValid = false;
  }

    setFormErrors(errors);
    return isValid; // Now it correctly returns false if any field is empty
  };

  const handleDownloadExcel = () => {
    const worksheetData = [
      ["partcode", "partdescription", "rohsstatus", "racklocation", "msdstatus", "technology", "unitprice", "quantity",
        "UOM", "AFO", "ComponentUsage", "TYC", "TLT", "MOQ", "TRQty", "POSLT", "BG", "expdateapplicable", "shelflife"]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

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
    setFormData({
      partcode: '', partdescription: '', rohsstatus: '', racklocation: '', msdstatus: '', technology: '', unitprice: '', createdby: '',
      modifiedby: '', quantity: '', UOM: '', AFO: '', ComponentUsage: '', TYC: '', TLT: '', MOQ: '', TRQty: '', POSLT: '', BG: '', expdateapplicable: '', shelflife: 0
    }); setSelectedRows([]);
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
      const expectedColumns = ["partcode", "partdescription", "rohsstatus", "racklocation", "msdstatus", "technology", "unitprice", "quantity",
        "UOM", "AFO", "ComponentUsage", "TYC", "TLT", "MOQ", "TRQty", "POSLT", "BG", "expdateapplicable", "shelflife"];

      const isValid = expectedColumns.every((col) => sheetHeaders.includes(col));
      const parsedData = XLSX.utils.sheet_to_json(worksheet);

      if (!parsedData || parsedData.length === 0) {
        setErrorMessage("No data found in the uploaded file");
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
      // console.error("File read error:", error);
      setErrorMessage("File read error:", error);
        setShowErrorPopup(true);
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
    // console.log("Recalculating column widths...");
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
      setFormData({
        partcode: '', partdescription: '', rohsstatus: '', racklocation: '', msdstatus: '', technology: '', unitprice: '', createdby: '',
        modifiedby: '', quantity: '', UOM: '', AFO: '', ComponentUsage: '', TYC: '', TLT: '', MOQ: '', TRQty: '', POSLT: '', BG: '', expdateapplicable: '', shelflife: 0
      });
    } else {
      setSelectedRows([]);
      setDeletButton(false);
      setHandleSubmitButton(true);
    }
  };

  useEffect(() => {
    // console.log("setSelectedRows:", selectedRows); // Logs the updated state
  }, [selectedRows]);

  const handleRowSelect = (rowKey) => {
    setHandleUpdateButton(false);

    setFormData({
      partcode: '', partdescription: '', rohsstatus: '', racklocation: '', msdstatus: '', technology: '', unitprice: '', createdby: '',
      modifiedby: '', quantity: '', UOM: '', AFO: '', ComponentUsage: '', TYC: '', TLT: '', MOQ: '', TRQty: '', POSLT: '', BG: '', expdateapplicable: '', shelflife: 0
    });
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowKey);

      // Update selected rows
      const updatedRows = isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect
        : [...prevSelectedRows, rowKey]; // Select row

      // Conditional button states based on updated rows
      if (updatedRows.length === 0) {
        setDeletButton(false);
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
      } else {
        setDeletButton(true);
        setHandleSubmitButton(false);
      }
      return updatedRows;
    });
  };

  const column =[
    {
      name: (
        <div style={{ textAlign: 'center',marginLeft:'10px' }}>
          <label>Select </label>
          <br />
          <input type="checkbox" onChange={handleSelectAll}
            checked={selectedRows.length === rcStoreData.length && rcStoreData.length > 0}
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
    }
    ,
    { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
    ,
    {
      name: "PartCode",
      selector: row => row.partcode,
      sortable: true,
      width: `${calculateColumnWidth(rcStoreData, 'partcode')}px`
    },
    {
      name: "Part Description",
      selector: row => row.partdescription,
      wrap: true,
      width: `${calculateColumnWidth(rcStoreData, 'partdescription')}px`
    },
    {
      name: "Rohs Status",
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
      name: "Component Usage",
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
      name: (<div>Exp-date <br />Applicable</div>),
      selector: row => row.expdateapplicable,
      width: `${calculateColumnWidth(rcStoreData, 'expdateapplicable')}px`
    },
    {
      name: "Shelf Life",
      selector: row => row.shelflife,
      width: `${calculateColumnWidth(rcStoreData, 'shelflife')}px`
    }

  ];

 const handlePageChange = useCallback((newPage) => {
  setPage(newPage);
  fetchMainMaster(newPage, perPage); // call API for new page
}, [perPage]);

const handlePerRowsChange = useCallback((newPerPage, page) => {
  setPerPage(newPerPage);
  setPage(page);
  fetchMainMaster(page, newPerPage); // call API for new perPage
}, []);

  const excelUpload = (e) => {
    e.preventDefault();
    
    const errors = [];
    excelUploadData.slice(1).forEach((row) => {
      if (!row.partcode || row.partcode.trim() === "") {
        setErrorMessage("PartCode is Required");
        setShowErrorPopup(true);
        // errors.push("partcode  is required");
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
    // console.log("Final Payload for Bulk Upload:", updatedFormData);
    setLoading(true)
    saveBulkRcMain(updatedFormData)
      .then(() => {
        setSuccessMessage("Master Data Added Successfully."); // Set dynamic message
        setShowSuccessPopup(true);  // Show popup
        setShowUploadTable(false);
        setShowRcTable(true)
        setExcelUploadData([]);
         fetchMainMaster(page, perPage);
         setSearchText("");
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            const errorMessage = error.response.data?.error;
            const duplicateName = errorMessage?.split(": ")[1];
            const duplicateMail = errorMessage?.split(": ")[1];
            setErrorMessage(errorMessage); // Set error message for dialog
            setShowErrorPopup(true); // Show error popup
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
          setShowErrorPopup(true);
        }
      }).finally(()=>{
        setLoading(false)
      })
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
        // const data = response?.data || {};
        setRcStoreData(response.data.content || []);
        setTotalRows(response.data.totalElements || 0);
        // console.log("data.totalElements", data.totalElements)
        // console.log("data.content", data.content)
      })
      .catch((error) => {
        // console.error("Error fetching data:", error);
         setErrorMessage("Error fetching data:", error);
      setShowErrorPopup(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchFind = (page = 1, size = 10, search = "") => {
    setLoading(true);
    getRcmainMasterFind(page - 1, size, search)
      .then((response) => {
        const data = response?.data || {};
        setRcStoreData(data.content );
        setTotalRows(data.totalElements || 0);
        // console.log("findFetch", data.totalElements)
        // console.log("data.content", data.content)
      })
      .catch((error) => {
        // console.error("Error fetching data:", error);
          setErrorMessage("Error fetching data:", error);
      setShowErrorPopup(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(page, perPage, debouncedSearch);
    fetchRcStore();
  }, [page, perPage, debouncedSearch]);

  const fetchData = (page = 1, size = 10, search = "") => {
    if (search && search.trim() !== "") {
      fetchFind(page, size, search);    // Call search API
    } else {
      fetchMainMaster(page, perPage);      // Call default API
    }
  };

  const fetchRcStore = () => {
    fetchRc()
      .then((response) => {
        setRcStore(response.data || []);

      })

  }

  const onDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleCancel = () => {
    setSelectedRows([]);
    setConfirmDelete(false);
    setDeletButton(false);
    setHandleSubmitButton(true)
  };
  const handleDelete = async () => {
    try {
      await deleteRc(selectedRows); // API call
      setSuccessMessage("Data successfully deleted");
      setShowSuccessPopup(true);
      setSelectedRows([]);
      setDeletButton(false);
      setHandleSubmitButton(true);
      fetchMainMaster(page, perPage);
      setConfirmDelete(false)

    } catch (error) {
      // console.error("Delete error:", error);
      setErrorMessage("Delete error: " + (error.message || "Something went wrong"));
      setShowErrorPopup(true);
    }
  };

  // const handleEdit = (row) => {
  //   setFormData(row); // or whatever sets the data
  //   formRef.current?.scrollIntoView({ behavior: "smooth" });
  //   setFormData({
  //     id: row.id || "",
  //     partcode: row.partcode || "",
  //     partdescription: row.partdescription || "",
  //     rohsstatus: row.rohsstatus || "", racklocation: row.racklocation || "",
  //     msdstatus: row.msdstatus || "", technology: row.technology || "",
  //     quantity: row.quantity || "", UOM: row.UOM || "",
  //     AFO: row.AFO || "", ComponentUsage: row.ComponentUsage || "",
  //     TYC: row.TYC || "", TLT: row.TLT || "", MOQ: row.MOQ || "",
  //     TRQty: row.TRQty || "", POSLT: row.POSLT || "",
  //     BG: row.BG || "", expdateapplicable: row.expdateapplicable || "",
  //     shelflife: row.shelflife || "",

  //   });
  //   setHandleSubmitButton(false);
  //   setHandleUpdateButton(true);
  //   setHandleUploadButton(false);
  //   setDeletButton(false);
  //   setSelectedRows([]);
  // }


  const handleEdit = (row) => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });

    // Convert comma-separated locations into rackRows array
    const initialRackRows = row.racklocation
        ? row.racklocation.split(",").map(loc => ({ racklocation: loc }))
        : [{ racklocation: "" }];

    setRackRows(initialRackRows);

    setFormData({
      id: row.id || "",
      partcode: row.partcode || "",
      partdescription: row.partdescription || "",
      rohsstatus: row.rohsstatus || "",
      msdstatus: row.msdstatus || "",
      technology: row.technology || "",
      quantity: row.quantity || "",
      UOM: row.UOM || "",
      AFO: row.AFO || "",
      ComponentUsage: row.ComponentUsage || "",
      TYC: row.TYC || "",
      TLT: row.TLT || "",
      MOQ: row.MOQ || "",
      TRQty: row.TRQty || "",
      POSLT: row.POSLT || "",
      BG: row.BG || "",
      expdateapplicable: row.expdateapplicable || "",
      shelflife: row.shelflife || ""
    });

    setHandleSubmitButton(false);
    setHandleUpdateButton(true);
    setHandleUploadButton(false);
    setDeletButton(false);
    setSelectedRows([]);
};

  const handleUpdate = (e, id) => {
    e.preventDefault();
    if (!valiDate()) return;
    setLoading(true);
    const modifiedby = sessionStorage.getItem("userName") || "System";
      const racklocationPayload = rackRows.map(row => row.racklocation).filter(Boolean).join(',');

    const updateFormData = {
      ...formData,
      id,
      modifiedby,
                racklocation: racklocationPayload,  // <- updated here

    }
    updateRcSrore(id, updateFormData)
      .then((response) => {
        setSuccessMessage("Updated sucessfully");
        setShowSuccessPopup(true);
        formClear();
        setHandleUpdateButton(false);
        setHandleSubmitButton(true);
        fetchMainMaster().then(() => {
          setPage(0);
        });

      }).catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage("Already exists");
            setShowErrorPopup(true);
          } else {
            setErrorMessage("Something went wrong");
            setShowErrorPopup(true);
          }
        }
      }).finally(() => {
        setLoading(false);
      });
  }

  const exportToExcel = (search = "") => {
    if (search && search.trim() !== "") {
      setLoading(true);
      downloadSearchRc(search) // <- pass search here
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "RcMain.xlsx");
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch((error) => {
          // console.error("Download failed:", error);
          setErrorMessage("Download failed:", error);
          setShowErrorPopup(true);
        })
        .finally(() => {
          setLoading(false);
        });

    } else {
      setLoading(true);
      downloadRc()
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "RcMain.xlsx");
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
  const addRow = () => {
    setRackRows([...rackRows, { racklocation: "" }]);
  };

  const removeRow = (index) => {
    const updatedRows = rackRows.filter((_, i) => i !== index);
    setRackRows(updatedRows.length ? updatedRows : [{ racklocation: "" }]); // always at least one row
  };
  return (
    <div className='COMCssContainer'>
      <div className='ComCssInput'>
        <div className='ComCssFiledName'>
          <p>RC Store</p>
        </div>
        <div className='ComCssUpload'>
          <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
          < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
          <button onClick={handleDownloadExcel}> Excel Download </button>
        </div>
        <div className='RcStoreTexfiled'>
          <ThemeProvider theme={TextFiledTheme}>
            <TextField
              id="outlined-basic"
              label="Partcode"
              variant="outlined"
              name="partcode"
              value={formData.partcode}
              onChange={handleChange}
              className='ProductTexfiled-textfield '
              error={Boolean(formErrors.partcode)}
              helperText={formErrors.partcode}
              size="small"
            />
            <TextField
              id="outlined-basic"
              label="Part Description"
              variant="outlined"
              name="partdescription"
              value={formData.partdescription}
              onChange={handleChange}
              size="small"
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
            />
            {/* <TextField
              id="outlined-basic"
              label="Rack Location"
              variant="outlined"
              name="racklocation"
              value={formData.racklocation}
              onChange={handleChange}
              //error={Boolean(formErrors.partcode)}
              //helperText={formErrors.partcode}
              //sx={{ "& .MuiInputBase-root": { height: "40px" } }}
              className='ProductTexfiled-textfield '
            /> */}
            
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
              className='ProductTexfiled-textfield '
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
              className='ProductTexfiled-textfield '
            />
            <Autocomplete
              options={["Yes", "No", "NotApplicable"]}
              getOptionLabel={(option) => (typeof option === "string" ? option : "")}
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
                  className='ProductTexfiled-textfield '
                />
              )}
            />
            {formData.expdateapplicable === 'No' && (
              <TextField
                id="shelfLife"
                label="Shelf Life"
                name="shelflife"
                type="number"
  value={formData.shelflife || 0}  // optional fallback
                onChange={handleChange}
                inputProps={{ min: 0 }}
                variant="outlined"
                size="small"
                className='ProductTexfiled-textfield '
              />
            )}
            <div   style={{
    maxHeight: 180,           // scroll after 3 rows
    overflowY: "auto",        // vertical scroll
    border: "1px solid #ccc", // full outer border
    borderRadius: 4,           // optional rounded corners
    // padding: 8,               // spacing inside the border
  }}> {/* Adjust height as needed */}
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        <TableCell>Rack Location</TableCell>
        <TableCell>
          <IconButton onClick={addRow} size="small" color="primary">
            <Add />
          </IconButton>
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rackRows.map((row, index) => (
        <TableRow key={index}>
          <TableCell>
            <TextField
              label="Rack Location"
              variant="outlined"
              size="small"
              fullWidth
              value={row.racklocation}
              onChange={(e) => handleLocationChange(index, e.target.value)} 
              error={Boolean(formErrors.racklocation)}      
              helperText={formErrors.racklocation || ""}   
            />
          </TableCell>
          <TableCell>
            {rackRows.length > 1 && (
              <IconButton onClick={() => removeRow(index)} size="small" color="error">
                <Remove />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

          </ThemeProvider>
        </div>
        <div className='ComCssButton9'>
          {handleSubmitButton && <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>}
          {handleUpdateButton && <button className='ComCssUpdateButton' onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
          {handleUploadButton && <button className='ComCssExcelUploadButton' onClick={excelUpload}>Upload</button>}
          {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}  >Delete</button>}
          <button className='ComCssClearButton' onClick={formClear}>Clear</button>
        </div>
      </div>

      <div className='ComCssTable'>
        {showRcTable && !showUploadTable && (
          <h5 className='ComCssTableName'>RCStore Details</h5>
        )}
        {showUploadTable && !showRcTable && (
          <h5 className='ComCssTableName'>Upload Master deatil</h5>
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
        {showRcTable && !showUploadTable && (
          <>
                          <LoadingOverlay loading={loading} />
          
          <DataTable
          key={resetKey}                 
  paginationDefaultPage={1} 
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
            fixedHeader
            fixedHeaderScrollHeight="400px"
            highlightOnHover
            className="react-datatable"
            // conditionalRowStyles={rowHighlightStyle}
          />
          </>
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

export default RcMainStore