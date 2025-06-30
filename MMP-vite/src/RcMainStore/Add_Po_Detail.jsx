import React, { useState, useMemo, useRef, useEffect } from 'react'
import './RcStore.css';
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import CustomDialog from "../COM_Component/CustomDialog";
import DropdownCom from '../COM_Component/DropdownCom'
import Popper from '@mui/material/Popper';
import Add_Po_DetailUI from './Add_Po_DetailUI';
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../COM_Component/TextFiledTheme'; 
import { deletePoDetail, downloadPoDetail, downloadSearchPoDetail, fetchCurency, fetchPoDeatil, getPartcode, getPoDetailFind, getVenodtMaster, savePoDetail, updatePoDeatil } from '../ServicesComponent/Services';
import dayjs from "dayjs"; // or use native JS date
import { FaTimesCircle } from "react-icons/fa"; // ❌ Stylish icon

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

  const [formData, setFormData] = useState({
    ordertype: "", potool: "", ponumber: "", podate: "",
    currency: "", vendorname: "", vendorcode: "", partcode: "", unitprice: "", orderqty: "", totalvalue: "",
    ccf: "", totalvalueeuro: "", createdby: "", updatedby: "", partdiscription: ""
  })

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

    if (!formData.orderType) {
      errors.ordeType = "please select orderType";
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
    if (!formData.currency) {
      errors.currency = "please select currency";
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
        width: '900px' // ✅ Your desired dropdown width
      }}
      placement="bottom-start"
    />
  );
  const fetchVendotMaster = async () => {
    setLoading(true);
    try {
      const response = await getVenodtMaster();
      setVendorMaster(response.data);
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
      console.error("Error fetching vendors", error);
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
      console.error("Error fetching vendors", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoDetail = (page = 1, size = 10) => {
    fetchPoDeatil(page - 1, size)
      .then((response) => {
        setPoDetail(response.data.content || []);
        setTotalRows(response.data.totalElements || 0);

        console.log('fetchPodetail', response.data);
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
    console.log("searchfetch", search);
    if (search && search.trim() !== "") {
      fetchfind(page, size, search);

    } else {
      fetchPoDetail(page, perPage);
    }
  }
  // Step 1: Extract month from formData.podate
  //const selectedMonth = formData.podate ? dayjs(formData.podate).format("YYYY-MM") : null;

  // Step 2: Filter curencyMaster by selected month
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

  console.log("formData", formData)
  console.log("curencyMaster", curencyMaster)
  console.log("rcMainStore", rcMainStore)


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
    setIsFrozen(false);
    setShowTable(false);
    setFormData({
      orderType: "", potool: "", ponumber: "", podate: "",
      currency: "", vendorname: "", vendorcode: "", partcode: "", unitprice: "", orderqty: "", totalvalue: "",
      ccf: "", totalvalueeuro: "", createdby: "", updatedby: "", postatus: "", ordertype: "", partdiscription: "", UOM: ""
    })
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
      name: "orderType",
      selector: row => row.orderType,
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
              //setFormData({ productname: '', partcode: '', createdBy: '', updatedby: '', productgroup: '', productfamily: '' });
  
          } else {
              setSelectedRows([]);
              setDeletButton(false);
              setHandleSubmitButton(true);
          }
      };
  
      useEffect(() => {
          console.log("selectedRows", selectedRows);
      }, [selectedRows]);
  
  
      const handleRowSelect = (rowKey) => {
          setHandleUpdateButton(false);
          //setFormData({ partcode: "", partdescription: "", productname: "", productgroup: "", productfamily: "" });
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
  const Defaultcolumn = [
     {
      name: (
        <div style={{textAlign: 'center', }}>
          <label>Delete All</label>
          <br />
          <input type="checkbox" onChange={handleSelectAll} 
            checked={selectedRows.length === poDetail.length && poDetail.length > 0}
          />
        </div>
      ),
      cell: (row) => (
        <div style={{ paddingLeft: '27px', width: '100%' }}>
          <input type="checkbox"  checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)}
          />
        </div>
      ),
      width: "97px",
      center: true, // ✅ makes both header and cell content centered
    }
    ,
    { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}  ><FaEdit /></button>), width: "79px" },
    ,
    {
      name: "orderType",
      selector: row => row.ordertype,
      sortable: true,
      // width: '130px'
      width: `${calculateColumnWidth('ordertype')}px`
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
      selector: row => row.podate?.split(" ")[0], // ⬅️ Extract date part before space
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
  const handleRemoveRow = (indexToRemove) => {
    const newData = tableData.filter((_, index) => index !== indexToRemove);
        setTableData(newData);

    if(newData.length===0){
      setShowTable(false);
    }
  };
  console.log("tabledata", poDetail)

  // const handleAddClick = () => {
  //  // if (!valiDate()) return;

  //   setShowTable(true);
  //   // setTableData([...tableData, {  orderType: "", potool: "", ponumber: "", podate: "",
  //   //   currency: "", vendorname: "", vendorcode: "", partcode: "", unitprice: "", orderqty: "", totalvalue: "",
  //   //   ccf: "", totalvalueeuro: "", createdby: "", updatedby: "", postatus: "", ordertype: "", partdiscription: "", UOM: ""}]); // initial blank row
  //   setTableData(prev => [...prev, formData]); // Push actual formData, not empty row


  // };
  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split(" ")[0].split("-");
    return `${day}/${month}/${year}`;
  };
  const handleAddClick = () => {
   if (!valiDate()) return;
    setShowTable(true);
    setTableData(prev => [...prev, formData]); // add row
    setIsFrozen(true); // 🧊 freeze some fields

    // Clear only the editable ones
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
    e.preventDefault();
    const createdby = sessionStorage.getItem("userName") || "System";
    const modifiedby = sessionStorage.getItem("userName") || "System";

    const updatedFormData = tableData.map((row) => ({
      ...row,
      createdby,
      modifiedby,
    }));

    savePoDetail(updatedFormData)
      .then((response) => {
        setSuccessMessage(response.data.message);
        setShowSuccessPopup(true);
        fetchPoDetail(page,perPage);
        // fetchProduct(page, perPage);
        //setPage(1);
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
      });

  };

  const handleEdit = (row) => {
    setHandleAdd(false);

    sethidePonumber(true);
    setFormData(row);
    console.log("Editing Row Data:", row);  // Debugging
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
        fetchPoDetail(page,perPage);
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
        fetchPoDetail(page,perPage);
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
                      console.log("search", data.content);
                  }).catch((error) => {
                      setErrorMessage("data not availbe", error);
                      setShowErrorPopup(true);
                  }).finally(() => {
                      setLoading(false);
                  })
          }
      const exportToExcel = (search = "") => {
              console.log("searchTeaxt", search)
              if (search && search.trim() !== "") {
      
                  setLoading(true);
                  downloadSearchPoDetail(search) // <- pass search here
                      .then((response) => {
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", "PoDetail.xlsx");
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
                  downloadPoDetail()
                      .then((response) => {
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", "PoDetail.xlsx");
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
  return (
    <div className='COMCssContainer'>
      <div className='ComCssInput'>
        <div className='ComCssFiledName'>
          <h5>ADD PO</h5>
        </div>
        <div className='ProductTexfiled'>
                    <ThemeProvider theme={TextFiledTheme}>
          
          <Autocomplete
            disabled={isFrozen} // ✅ freeze if either is true



            options={["Project", "Repair"]}
            getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
            value={formData.ordertype || []}
            onChange={(event, newValue) => setFormData({ ...formData, ordertype: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Order Type"
                variant="outlined"
                error={Boolean(formErrors.ordertype)}
                helperText={formErrors.ordertype}
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
            disabled={isFrozen} // ✅ freeze after Add

            options={["I-BUY", "P20", "SRM", "Nokia Internal Transfer", "RC Internal Transfer"]}
            getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
            value={formData.potool || []}
            onChange={(event, newValue) => setFormData({ ...formData, potool: newValue || [] })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Potoll"
                variant="outlined"
                error={Boolean(formErrors.potool)}
                helperText={formErrors.potool}
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
          <TextField
            id="outlined-basic"
            label="PoNumber"
            variant="outlined"
            disabled={hidePonumber || isFrozen} // ✅ freeze if either is true

            name="ponumber"
            value={formData.ponumber}
            onChange={handleChange}
            error={Boolean(formErrors.ponumber)}
            helperText={formErrors.ponumber}
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
            label="Po Date"
            InputLabelProps={{ shrink: true }}
            disabled={isFrozen} // ✅ freeze after Add
            variant="outlined"
            name="podate"
            value={formData.podate?.split(" ")[0] || ""}
            type="Date"
            onChange={handleChange}
            error={Boolean(formErrors.podate)}
            helperText={formErrors.podate}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <Autocomplete
            disabled={isFrozen} // ✅ freeze after Add

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
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green",
                    fontWeight: "bold",
                  },
                }}
              />
            )}
          />


          <Autocomplete
            disabled={isFrozen} // ✅ freeze after Add
            options={vendorMaster}
            getOptionLabel={(option) => option.vendorName || ""} // ensure it's a string
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
                label="Vendorname"
                variant="outlined"
                error={Boolean(formErrors.vendorname)}
                helperText={formErrors.vendorname}
                size="small"
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green",
                    fontWeight: "bold",
                  },
                }}
              />
            )}
          />


          <TextField
            disabled={isFrozen} // ✅ freeze after Add

            label="Vendorcode"
            InputProps={{ readOnly: true }}

            variant="outlined"
            name="Vendorcode"
            value={formData.vendorcode}
            onChange={handleChange}
            //  InputLabelProps={{ shrink: false }}

            // error={Boolean(formErrors.vendorcode)}
            // helperText={formErrors.vendorcode}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
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
                  partdescription: newValue.partdescription  // ✅ spelling fix
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
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green",
                    fontWeight: 'bold',
                  }
                }}
              />
            )}
          />
          <Autocomplete
            options={rcMainStore}
            ListboxComponent={DropdownCom}
            PopperComponent={CustomPopper}
            getOptionLabel={(option) => option?.partdescription || ""}  // ✅ fix here
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
                label="Partdescription"
                variant="outlined"
                error={Boolean(formErrors.partdescription)}
                helperText={formErrors.partdescription}
                size="small"
                sx={{
                  "& label.MuiInputLabel-shrink": {
                    color: "green",
                    fontWeight: 'bold',
                  }
                }}
              />
            )}
          />

          <TextField
            label="Unitprice"
            variant="outlined"
            name="unitprice"
            type="number"
            value={formData.unitprice}
            onChange={handleChange}
            error={Boolean(formErrors.unitprice)}
            helperText={formErrors.unitprice}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            label="Orderqty"
            variant="outlined"
            name="orderqty"
            type="text" // 👈 use text to control input better
            value={formData.orderqty}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) { // ✅ only allow digits (0-9), no dot
                setFormData({ ...formData, orderqty: value });
              }
            }}
            error={Boolean(formErrors.orderqty)}
            helperText={formErrors.orderqty}
            size="small"
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green",
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            label="Totalvalue"
            InputProps={{ readOnly: true }}
            variant="outlined"
            name="totalvalue"
            value={formData.totalvalue}
            onChange={handleChange}
            //  InputLabelProps={{ shrink: false }}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            label="Currency convertion factor"
            InputProps={{ readOnly: true }}
            variant="outlined"
            name="ccf"
            value={formData.ccf}
            onChange={handleChange}
            //InputLabelProps={{ shrink: false }}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          <TextField
            label="Totalvalueeuro"
            InputProps={{ readOnly: true }}
            variant="outlined"
            name="totalvalueeuro"
            value={formData.totalvalueeuro}
            onChange={handleChange}
            //InputLabelProps={{ shrink: false }}
            size="small"  // <-- Reduce height
            sx={{
              "& label.MuiInputLabel-shrink": {
                color: "green", // label color when floated
                fontWeight: 'bold'
              }
            }}
          />
          </ThemeProvider>
        </div>
        <div className='ComCssButton9'>
          {handleAdd && <button style={{ backgroundColor: 'green' }} onClick={handleAddClick} >ADD</button>}
          {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
          {deletButton && <button style={{ backgroundColor: 'orange' }} onClick={onDeleteClick}   >Delete</button>}

          <button onClick={formClear}>Clear</button>
        </div>

      </div>
      {showTable && (
        <div className='ComCssTable'>
          <h5 className='prodcutTableName'>ADD PoDeatil</h5>

          <DataTable
            columns={column}
            data={tableData}
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
            //conditionalRowStyles={rowHighlightStyle}
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

          <div className='ComCssSubmitButton9'>
            {handleAdd && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit} >Submit</button>}
          </div>
        </div>
      )}

      <div className='ComCssTable'>
        <h5 className='ComCssTableName'>PO Detail</h5>
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
          fixedHeader    // ✅ ADD THIS LINE
          fixedHeaderScrollHeight="400px"
          highlightOnHover
          className="react-datatable"
          //conditionalRowStyles={rowHighlightStyle}
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

export default Add_Po_Detail