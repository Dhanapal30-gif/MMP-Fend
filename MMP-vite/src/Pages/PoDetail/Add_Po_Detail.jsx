import React, { useState, useMemo, useRef, useEffect } from 'react'
// import './RcStore.css';
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import DropdownCom from '../../components/Com_Component/DropdownCom'
import Popper from '@mui/material/Popper';
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import { deletePoDetail, downloadPoDetail, downloadSearchPoDetail, fetchCurency, fetchPoDeatil, getPartcode, getPoDetailFind, getVenodtMaster, savePoDetail, updatePoDeatil } from '../../Services/Services';
import dayjs from "dayjs"; // or use native JS date
import { FaTimesCircle } from "react-icons/fa";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";

const Add_Po_Detail = () => {
  const [formErrors, setFormErrors] = useState({});
  const [excelUploadData, setExcelUploadData] = useState([]);
  const [handleUploadButton, setHandleUploadButton] = useState(false);
  const [handleUpdateButton, setHandleUpdateButton] = useState(false);
  const [handleSubmitButton, setHandleSubmitButton] = useState(true);
  const [handleAdd, setHandleAdd] = useState(true)
  const fileInputRef = useRef(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [showTable, setShowTable] = useState(false);
  const [poDetail, setPoDetail] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [deletButton, setDeletButton] = useState();
  const [selectedRows, setSelectedRows] = useState([]);
  const [hidePonumber, sethidePonumber] = useState(false);
  const [bomMaster, setBomMaster] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showBomTable, setShowBomTable] = useState(true);
  const [perPage, setPerPage] = useState(20);
  const [showUploadTable, setShowUploadTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [options, setOptions] = useState([]);
  const [storeRc, setStoreRc] = useState([]);
  const [storeProduct, setStoreProduct] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [vendorMaster, setVendorMaster] = useState([]);
  const [curencyMaster, setCurencyMaster] = useState([]);
  const [rcMainStore, setRcMainStore] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadDone, setDownloadDone] = useState(false);
  const [formData, setFormData] = useState({
    ordertype: "", potool: "", ponumber: "", podate: "",
    currency: "", vendorname: "", vendorcode: "", partcode: "", unitprice: "", orderqty: "", totalvalue: "",
    ccf: "", totalvalueeuro: "", createdby: "", updatedby: "", partdiscription: ""
  })

  const [table1Page, setTable1Page] = useState(1);
  const [table1PerPage, setTable1PerPage] = useState(10);
  const [table1TotalRows, setTable1TotalRows] = useState(0);



  const handleTable1PageChange = (table1Page) => setTable1Page(table1Page);
  const handleTable1PerRowsChange = (newPerPage, page) => setTable1PerPage(newPerPage);



  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  const debouncedSearch = useDebounce(searchText, 500); // delay in ms

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const valiDate = () => {
    const errors = {};
    let isValid = true;

    if (!formData.ordertype) {
      errors.ordertype = "please select orderType";
      isValid = false;
    }
    if (!formData.potool) {
      errors.potool = "please select potool";
      isValid = false;
    }
    if (!formData.ponumber) {
      errors.ponumber = "please select ponumber";
      isValid = false;
    }
    if (!formData.podate) {
      errors.podate = "please select podate";
      isValid = false;
    }
    if (!formData.currency) {
      errors.currency = "please select currency";
      isValid = false;
    }
    if (!formData.vendorname) {
      errors.vendorname = "please select vendorname";
      isValid = false;
    }
    if (!formData.partcode) {
      errors.partcode = "please select partcode";
      isValid = false;
    }
    if (!formData.orderqty) {
      errors.orderqty = "please select orderqty";
      isValid = false;
    }
    if (!formData.unitprice) {
      errors.unitprice = "please select unitprice";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  }

  const CustomPopper = (props) => (
    <Popper
      {...props}
      style={{
        ...props.style,
        width: '900px'
      }}
      placement="bottom-start"
    />
  );
  const fetchVendotMaster = async () => {
    setLoading(true);
    try {
      const response = await getVenodtMaster();

      // Filter out items where vendorName is null/undefined
      const cleanedData = (response.data || []).filter(
        item => item.vendorName != null && item.vendorName !== ""
      );

      setVendorMaster(cleanedData);
    } catch (error) {
      console.error("Error fetching vendors", error);
    } finally {
      setLoading(false);
    }
  };


  const fetchCurrencyMaster = async () => {
    setLoading(true);
    try {
      const response = await fetchCurency();
      setCurencyMaster(response.data);
    } catch (error) {
      // console.error("Error fetching vendors", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchRcStoreMaster = async () => {
    setLoading(true);
    try {
      const response = await getPartcode();
      setRcMainStore(response.data);
    } catch (error) {
      // console.error("Error fetching vendors", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoDetail = (page = 1, size = 10) => {
    fetchPoDeatil(page - 1, size)
      .then((response) => {
        setPoDetail(response.data.content || []);
        setTotalRows(response.data.totalElements || 0);
        // console.log('fetchPodetail', response.data);
      })
  }
  useEffect(() => {
    fetchCurrencyMaster();
    fetchRcStoreMaster();
    fetchVendotMaster();
    //fetchPoDetail(page,perPage);
  }, []);

  useEffect(() => {
    fetchData(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch])

  const fetchData = (page = 1, size = 10, search = "") => {
    // console.log("searchfetch", search);
    if (search && search.trim() !== "") {
      fetchfind(page, size, search);

    } else {
      fetchPoDetail(page, perPage);
      setSelectedRows([]);

    }
  }

  const selectedMonth = formData.podate
    ? new Date(formData.podate).toISOString().slice(0, 7) // "YYYY-MM"
    : null;

  const filteredCurrencyOptions = selectedMonth
    ? curencyMaster
      .filter((item) => item.effectivedate.startsWith(selectedMonth))
      .map((item) => ({
        currencyname: item.currencyname,
        currencyvalue: item.currencyvalue
      })) : [];

  // console.log("formData", formData)
  // console.log("curencyMaster", curencyMaster)
  // console.log("rcMainStore", rcMainStore)

  useEffect(() => {
    const qty = parseFloat(formData.orderqty) || 0;
    const price = parseFloat(formData.unitprice) || 0;
    const total = qty * price;
    setFormData((prev) => ({ ...prev, totalvalue: total.toFixed(2) }));
  }, [formData.orderqty, formData.unitprice]);

  useEffect(() => {
    const total = parseFloat(formData.totalvalue) || 0;
    const ccf = parseFloat(formData.ccf) || 0;
    const euro = total * ccf;
    setFormData((prev) => ({ ...prev, totalvalueeuro: euro.toFixed(2) }));
  }, [formData.totalvalue, formData.ccf]);

  const formClear = () => {
    setHandleAdd(true);
    setIsFrozen(false);
    setShowTable(false);
    setHandleUpdateButton(false);
    setDeletButton(false);
    setFormErrors("");
    // isvalid(false);
    setFormData({
      ordertype: "", potool: "", ponumber: "", podate: "",
      currency: "", vendorname: "", vendorcode: "", partcode: "", unitprice: "", orderqty: "", totalvalue: "",
      ccf: "", totalvalueeuro: "", createdby: "", updatedby: "", postatus: "", ordertype: "", partdiscription: "", UOM: ""
    })
    setSelectedRows([]);
  }
  const calculateColumnWidth = (data, key, charWrap = 19, charWidth = 8, minWidth = 190, maxWidth = 318) => {
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
  const column = [
    {
      name: "Cancel",
      selector: (row, index) => (
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
      width: "80px",
    },
    {
      name: "OrderType",
      selector: row => row.ordertype,
      sortable: true,
      width: '130px'
      // width: `${calculateColumnWidth( 'orderType')}px`
    },
    {
      name: "Potool",
      selector: row => row.potool,
      wrap: true,
      width: '150px'
    },
    {
      name: "Ponumber",
      selector: row => row.ponumber,
      width: `${calculateColumnWidth('ponumber')}px`
    },
    {
      name: "Podate",
      selector: row => row.podate,
      //width: `${calculateColumnWidth( 'modifieddate')}px`
      width: '130px'
    },
    {
      name: "Currency",
      selector: row => row.currency,
      //  width: `${calculateColumnWidth( 'currency')}px`
      width: '130px'
    },
    {
      name: "VendorName",
      selector: row => row.vendorname,
      wrap: true,
      grow: 2,
      width: `${calculateColumnWidth('vendorName')}px`
    },
    {
      name: "VendorCode",
      selector: row => row.vendorcode,
      //width: `${calculateColumnWidth( 'vendorCode')}px`
      width: '130px'
    },
    {
      name: "Partcode",
      selector: row => row.partcode,
      width: `${calculateColumnWidth('partcode')}px`
    },
    {
      name: "Partdiscription",
      selector: row => row.partdescription,
      wrap: true,
      grow: 2,
      width: `${calculateColumnWidth('partdiscription')}px`
    },
    {
      name: "Unitprice",
      selector: row => row.unitprice,
      // width: `${calculateColumnWidth( 'unitprice')}px`
      width: '130px'
    },
    {
      name: "Orderqty",
      selector: row => row.orderqty,
      //width: `${calculateColumnWidth( 'orderqty')}px`
      width: '130px'
    },
    {
      name: "Totalvalue",
      selector: row => row.totalvalue,
      width: '130px'
      // width: `${calculateColumnWidth( 'totalvalue')}px`
    },
    {
      name: "CCF",
      selector: row => row.ccf,
      width: '130px'
      // width: `${calculateColumnWidth( 'ccf')}px`
    },
    {
      name: "Totalvalueeuro",
      selector: row => row.totalvalueeuro,
      width: `${calculateColumnWidth('totalvalueeuro')}px`
    }
  ]

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(poDetail.map((row) => row.id)); // ✅ Ensure unique selection key
      setDeletButton(true);
      setHandleSubmitButton(false);
      setHandleUpdateButton(false);
      setHandleAdd(false)
      //setFormData({ productname: '', partcode: '', createdBy: '', updatedby: '', productgroup: '', productfamily: '' });

    } else {
      setSelectedRows([]);
      setDeletButton(false);
      setHandleSubmitButton(true);
      setHandleAdd(true)

    }
  };


  const handleRowSelect = (rowKey) => {
    setHandleUpdateButton(false);
    setHandleAdd(false);
    setHandleUpdateButton(false);
    //setFormData({ partcode: "", partdescription: "", productname: "", productgroup: "", productfamily: "" });
    setSelectedRows((prevSelectedRows) => {
      const isRowSelected = prevSelectedRows.includes(rowKey);
      // console.log("row", rowKey)
      const updatedRows = isRowSelected
        ? prevSelectedRows.filter((key) => key !== rowKey) // Deselect
        : [...prevSelectedRows, rowKey]; // Select row

      if (updatedRows.length === 0) {
        setDeletButton(false);
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
        setHandleAdd(true)

      } else {
        setDeletButton(true);
        setHandleSubmitButton(false);

      }
      return updatedRows;
    });
  };
  const Defaultcolumn = [
    {
      name: (
        <div style={{ textAlign: 'center', marginLeft: '10px' }}>
          <label>Select</label>
          <br />
          <input type="checkbox" onChange={handleSelectAll}
            checked={selectedRows.length === poDetail.length && poDetail.length > 0}
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
    { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}  ><FaEdit /></button>), width: "79px" },
    ,
    {
      name: "Order Type",
      selector: row => row.ordertype,
      sortable: true,
      width: '130px'
      // width: `${calculateColumnWidth('ordertype')}px`
    },
    {
      name: "Po Tool",
      selector: row => row.potool,
      wrap: true,
      width: '130px'
    },
    {
      name: "Po Number",
      selector: row => row.ponumber,
      wrap: true,
      width: `${calculateColumnWidth('ponumber')}px`
      // width: '130px'
    },
    {
      name: "Po Date",
      selector: row => row.podate?.split(" ")[0],
      //width: `${calculateColumnWidth( 'modifieddate')}px`
      width: '130px'
    },
    {
      name: "Currency",
      selector: row => row.currency,
      //  width: `${calculateColumnWidth( 'currency')}px`
      width: '130px'
    },
    {
      name: "Vendor Name",
      selector: row => row.vendorname,
      wrap: true,
      grow: 2,
      width: `${calculateColumnWidth('vendorName')}px`
    },
    {
      name: "Vendor Code",
      selector: row => row.vendorcode,
      //width: `${calculateColumnWidth( 'vendorCode')}px`
      width: '130px'
    },
    {
      name: "Partcode",
      selector: row => row.partcode,
      width: `${calculateColumnWidth('partcode')}px`
    },
    // {
    //   name: "Partdiscription",
    //   selector: row => row.partdescription,
    //   wrap: true,
    //   grow: 2,
    //   width: `${calculateColumnWidth('partdiscription')}px`
    // },
    {
      name: "Unitprice",
      selector: row => row.unitprice,
      // width: `${calculateColumnWidth( 'unitprice')}px`
      width: '130px'
    },
    {
      name: "Order Qty",
      selector: row => row.orderqty,
      //width: `${calculateColumnWidth( 'orderqty')}px`
      width: '130px'
    },
    {
      name: "Totalvalue",
      selector: row => row.totalvalue,
      width: '130px'

      // width: `${calculateColumnWidth( 'totalvalue')}px`
    },
    {
      name: "CCF",
      selector: row => row.ccf,
      width: '130px'
      // width: `${calculateColumnWidth( 'ccf')}px`
    },
    {
      name: "Totalvalue Euro",
      selector: row => row.totalvalueeuro,
      width: `${calculateColumnWidth('totalvalueeuro')}px`
    }

  ]
  const handleRemoveRow = (indexToRemove) => {
    const newData = tableData.filter((_, index) => index !== indexToRemove);
    setTableData(newData);

    if (newData.length === 0) {
      setShowTable(false);
      setFormData({
        ordertype: "", potool: "", ponumber: "", podate: "",
        currency: "", vendorname: "", vendorcode: "", partcode: "", unitprice: "", orderqty: "", totalvalue: "",
        ccf: "", totalvalueeuro: "", createdby: "", updatedby: "", postatus: "", ordertype: "", partdiscription: "", UOM: ""
      })
      setIsFrozen(false);
    }
  };
  // console.log("tabledata", poDetail)
  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };
  // const handleAddClick = () => {
  //   if (!valiDate()) return;
  //   setShowTable(true);
  //   setTableData(prev => [...prev, formData]); // add row
  //   setIsFrozen(true);
  //   setFormData(prev => ({
  //     ...prev,
  //     partcode: "",
  //     partdescription: "",
  //     unitprice: "",
  //     orderqty: "",
  //     totalvalue: "",
  //     totalvalueeuro: "",
  //   }));
  // };
  const handleAddClick = () => {
    if (!valiDate()) return;

    // Check if partcode already exists
    const isDuplicate = tableData.some(item => item.partcode === formData.partcode);
    if (isDuplicate) {
      setErrorMessage("Partcode already exists");
      setShowErrorPopup(true);
      return;
    }

    setShowTable(true);
    setTableData(prev => [...prev, formData]);
    setIsFrozen(true);
    setFormData(prev => ({
      ...prev,
      partcode: "",
      partdescription: "",
      unitprice: "",
      orderqty: "",
      totalvalue: "",
      totalvalueeuro: "",
    }));
  };


  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePerRowsChange = (newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
  }

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();
    const createdby = sessionStorage.getItem("userName") || "System";
    const updatedby = sessionStorage.getItem("userName") || "System";
    const updatedFormData = tableData.map((row) => ({
      ...row,
      createdby,
      updatedby,
    }));
    savePoDetail(updatedFormData)
      .then((response) => {
        setSuccessMessage(response.data.message);
        setShowSuccessPopup(true);
                fetchPoDetail(page, perPage);
        setShowTable(false);
        setTableData([]);
        formClear();

      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage(error.response.data.message);
            setShowErrorPopup(true);
          } else {
            setErrorMessage(error.response.data.message);
            setShowErrorPopup(true);
          }
        } else {
          setErrorMessage("Network error, please try again");
          setShowErrorPopup(true);
        }
      }).finally(() => {
            setLoading(false); // always stop loader
        });
  };

  const handleEdit = (row) => {
    setHandleAdd(false);
    sethidePonumber(true);
    setFormData(row);
    // console.log("Editing Row Data:", row);  // Debugging
    setFormData({
      id: row.id || "",
      ordertype: row.ordertype || "",
      potool: row.potool || "",
      ponumber: row.ponumber || "",
      podate: row.podate || "",
      currency: row.currency || "",
      vendorname: row.vendorname || "",
      vendorcode: row.vendorcode || "",
      partcode: row.partcode || "",
      //partdescription: row.partdescription || "",
      unitprice: row.unitprice || "",
      orderqty: row.orderqty || "",
      totalvalue: row.totalvalue || "",
      ccf: row.ccf || "",
      totalvalueeuro: row.totalvalueeuro || "",
    });
    setHandleSubmitButton(false);
    setHandleUploadButton(false);
    setHandleUpdateButton(true);
    setDeletButton(false);
    setSelectedRows([]);
  };

  const handleUpdate = (e, id) => {
    e.preventDefault();
    if (!valiDate()) return;
    setLoading(true);
    const updatedby = sessionStorage.getItem('userName') || "System";
    const updateFormData = {
      ...formData,
      id,
      updatedby
    };

    updatePoDeatil(id, updateFormData)
      .then((response) => {
        setSuccessMessage(response.data.message);
        setShowSuccessPopup(true);
        fetchPoDeatil(page, perPage);
        formClear();
        setShowTable(false);
        setTableData([]);
        setHandleAdd(true);
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
        fetchPoDetail(page, perPage);
        setSearchText("");
      }).catch((error) => {
        setLoading(false);
        if (error.response) {
          if (error.response.status === 409) {
            setErrorMessage(error.response.data.message);
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
    setConfirmDelete(false);

    try {
      await deletePoDetail(selectedRows);
      setSuccessMessage("Data successfullly deleted");
      setShowSuccessPopup(true);
      setSelectedRows([]);
      setHandleSubmitButton(true);
      setDeletButton(false);
      fetchPoDetail(page, perPage);
      setSearchText("");
    } catch (error) {
      setErrorMessage("delete error", error);
      setShowErrorPopup(true);

    }
  }

  const fetchfind = (page = 1, size = 10, search = "") => {
    setLoading(true);
    getPoDetailFind(page - 1, size, search)
      .then((response) => {
        const data = response.data || {};
        setPoDetail(data.content);
        setTotalRows(data.totalElements);
        // console.log("search", data.content);
      }).catch((error) => {
        setErrorMessage("data not availbe", error);
        setShowErrorPopup(true);
      }).finally(() => {
        setLoading(false);
      })
  }
  const exportToExcel = (search = "") => {
    setDownloadDone(false);
    setDownloadProgress(null);
    setLoading(true);

    const apiCall = search?.trim() !== "" ? downloadSearchPoDetail : downloadPoDetail;

    apiCall(search, {
      onDownloadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setDownloadProgress(percent);
      },
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "PoDetail.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        setDownloadDone(true);
      })
      .catch((error) => {
        console.error("Download failed:", error);
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setDownloadDone(false), 5000); // Reset "Done" after 3s
      });
  };
  return (
    <div className='COMCssContainer'>
      <div className='ComCssInput'>
        <div className='ComCssFiledName'>
          <p>ADD PO</p>
        </div>
        <div className='ProductTexfiled'>
          <ThemeProvider theme={TextFiledTheme}>

            <Autocomplete
              disabled={isFrozen}
              options={["Project", "Repair"]}
              getOptionLabel={(option) => (typeof option === "string" ? option : "")}
              value={formData.ordertype || []}
              onChange={(event, newValue) => setFormData({ ...formData, ordertype: newValue || [] })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Order Type"
                  variant="outlined"
                  error={Boolean(formErrors.ordertype)}
                  helperText={formErrors.ordertype}
                  size="small"

                />
              )}
            />
            <Autocomplete
              disabled={isFrozen}
              options={["I-BUY", "P20", "SRM", "Nokia Internal Transfer", "RC Internal Transfer"]}
              getOptionLabel={(option) => (typeof option === "string" ? option : "")}
              value={formData.potool || []}
              onChange={(event, newValue) => setFormData({ ...formData, potool: newValue || [] })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Po Toll"
                  variant="outlined"
                  error={Boolean(formErrors.potool)}
                  helperText={formErrors.potool}
                  size="small"
                />
              )}
            />
            <TextField
              id="outlined-basic"
              label="Po Number"
              variant="outlined"
              disabled={hidePonumber || isFrozen}
              name="ponumber"
              value={formData.ponumber}
              onChange={handleChange}
              error={Boolean(formErrors.ponumber)}
              helperText={formErrors.ponumber}
              size="small"
            />
            <TextField
              id="outlined-basic"
              label="Po Date"
              InputLabelProps={{ shrink: true }}
              disabled={isFrozen}
              variant="outlined"
              name="podate"
              value={formData.podate?.split(" ")[0] || ""}
              type="Date"
              onChange={handleChange}
              error={Boolean(formErrors.podate)}
              helperText={formErrors.podate}
              size="small"  // <-- Reduce height
            />
            <Autocomplete
              disabled={isFrozen}
              options={filteredCurrencyOptions}
              getOptionLabel={(option) => option.currencyname || ""}
              value={
                filteredCurrencyOptions.find(
                  (item) => item.currencyname === formData.currency
                ) || null
              }
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  currency: newValue?.currencyname || "",
                  ccf: newValue?.currencyvalue || "",
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Currency"
                  error={Boolean(formErrors.currency)}
                  helperText={formErrors.currency}
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <Autocomplete
              disabled={isFrozen}
              options={vendorMaster}
              ListboxComponent={DropdownCom}

              getOptionLabel={(option) => option.vendorName || ""}
              value={vendorMaster.find(item => item.vendorName === formData.vendorname) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  setFormData({
                    ...formData,
                    vendorname: newValue.vendorName,
                    vendorcode: newValue.vendorCode,
                  });
                } else {
                  setFormData({
                    ...formData,
                    vendorname: "",
                    vendorcode: "",
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vendor Name"
                  variant="outlined"
                  error={Boolean(formErrors.vendorname)}
                  helperText={formErrors.vendorname}
                  size="small"

                />
              )}
            />
            <TextField
              disabled={isFrozen}
              label="Vendor Code"
              InputProps={{ readOnly: true }}
              variant="outlined"
              name="Vendorcode"
              value={formData.vendorcode}
              onChange={handleChange}
              //  InputLabelProps={{ shrink: false }}
              // error={Boolean(formErrors.vendorcode)}
              // helperText={formErrors.vendorcode}
              size="small"
            />
            <Autocomplete
              options={rcMainStore}
              getOptionLabel={(option) => option?.partcode || ""}
              isOptionEqualToValue={(option, value) => option.partcode === value.partcode}
              value={rcMainStore.find(item => item.partcode === formData.partcode) || null}
              ListboxComponent={DropdownCom}
              onChange={(event, newValue) => {
                if (newValue) {
                  setFormData({
                    ...formData,
                    partcode: newValue.partcode,
                    partdescription: newValue.partdescription
                  });
                } else {
                  setFormData({ ...formData, partcode: "", partdescription: "" });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Partcode"
                  variant="outlined"
                  error={Boolean(formErrors.partcode)}
                  helperText={formErrors.partcode}
                  size="small"
                />
              )}
            />
            <Autocomplete
              options={rcMainStore}
              ListboxComponent={DropdownCom}
              PopperComponent={CustomPopper}
              getOptionLabel={(option) => option?.partdescription || ""}
              isOptionEqualToValue={(option, value) => option.partdescription === value.partdescription}
              value={rcMainStore.find(item => item.partdescription === formData.partdescription) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  setFormData({
                    ...formData,
                    partcode: newValue.partcode,
                    partdescription: newValue.partdescription
                  });
                } else {
                  setFormData({ ...formData, partcode: "", partdescription: "" });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="part Description"
                  variant="outlined"
                  error={Boolean(formErrors.partdescription)}
                  helperText={formErrors.partdescription}
                  size="small"
                />
              )}
            />
            <TextField
              label="Unit Price"
              variant="outlined"
              name="unitprice"
              type="number"
              value={formData.unitprice}
              onChange={handleChange}
              error={Boolean(formErrors.unitprice)}
              helperText={formErrors.unitprice}
              size="small"
            />
            <TextField
              label="Order Qty"
              variant="outlined"
              name="orderqty"
              type="text"
              value={formData.orderqty}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setFormData({ ...formData, orderqty: value });
                }
              }}
              error={Boolean(formErrors.orderqty)}
              helperText={formErrors.orderqty}
              size="small"

            />
            <TextField
              label="Total Value"
              InputProps={{ readOnly: true }}
              variant="outlined"
              name="totalvalue"
              value={formData.totalvalue}
              onChange={handleChange}
              //  InputLabelProps={{ shrink: false }}
              size="small"
            />
            <TextField
              label="Currency Convertion Factor"
              InputProps={{ readOnly: true }}
              variant="outlined"
              name="ccf"
              value={formData.ccf}
              onChange={handleChange}
              //InputLabelProps={{ shrink: false }}
              size="small"
            />
            <TextField
              label="Total Value Euro"
              InputProps={{ readOnly: true }}
              variant="outlined"
              name="totalvalueeuro"
              value={formData.totalvalueeuro}
              onChange={handleChange}
              //InputLabelProps={{ shrink: false }}
              size="small"
            />
          </ThemeProvider>
        </div>
        <div className='ComCssButton9'>
          {handleAdd && <button className='ComCssAddButton' onClick={handleAddClick} >ADD</button>}
          {handleUpdateButton && <button className='ComCssUpdateButton' onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
          {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}
          <button className='ComCssClearButton' onClick={formClear}>Clear</button>
        </div>

      </div>
      {showTable && (
        <div className='ComCssTable'>
          <h5 className='ComCssTableName'>ADD PO</h5>
          <DataTable
            columns={column}
            data={tableData}
            pagination
            // paginationServer
            progressPending={loading}
            paginationTotalRows={tableData.length}
            onChangeRowsPerPage={handleTable1PerRowsChange}
            onChangePage={handleTable1PageChange}
            // paginationCurrentPage={table1Page}      // <-- controlled current page

            paginationPerPage={table1PerPage}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            paginationComponentOptions={{
              rowsPerPageText: 'Rows per page:',
              rangeSeparatorText: 'of',
              noRowsPerPage: false,
              // selectAllRowsItem: true,
              // selectAllRowsItemText: 'All',
            }}
            fixedHeader
            fixedHeaderScrollHeight="400px"
            highlightOnHover
            className="react-datatable"
          //conditionalRowStyles={rowHighlightStyle}
          />

          <div className='ComCssSubmitButton9'>
            {handleAdd && <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>}
          </div>
        </div>
      )}

      <div className='ComCssTable'>
        <h5 className='ComCssTableName'>PO Detail</h5>
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
          <button className="btn btn-success" onClick={() => exportToExcel(searchText)} disabled={loading}>
            {loading
              ? downloadProgress !== null
                ? `Downloading... ${downloadProgress}%`
                : "Downloading..."
              : downloadDone
                ? "✅ Done"
                : (
                  <>
                    <FaFileExcel /> Export
                  </>
                )}
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
        <LoadingOverlay loading={loading} />
        <DataTable
          columns={Defaultcolumn}
          data={poDetail}
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
          fixedHeader
          fixedHeaderScrollHeight="400px"
          highlightOnHover
          className="react-datatable"
        />
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
export default Add_Po_Detail