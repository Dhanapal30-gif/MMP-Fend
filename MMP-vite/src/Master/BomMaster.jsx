import React, { useState, useMemo, useRef, useEffect } from 'react'
import './BOM.css'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { deleteBom, downloadBom, downloadSearchBom, getBoMaster, getBomMasterFind, getPartcode, getProduct, saveBomMaster, saveBomMasterUpload, updateBomMaster } from '../ServicesComponent/Services';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { FaEdit } from "react-icons/fa";
import "../COM_Component/COM_Css.css";
import CustomDialog from "../COM_Component/CustomDialog";
import { FixedSizeList } from 'react-window';
import TextFiledTheme from '../COM_Component/TextFiledTheme'; // your custom theme path
import DropdownCom from '../COM_Component/DropdownCom'
import Popper from '@mui/material/Popper';
import { ThemeProvider } from '@mui/material/styles';

const BomMaster = () => {
    const [formErrors, setFormErrors] = useState({});
    const [excelUploadData, setExcelUploadData] = useState([]);
    const [handleUploadButton, setHandleUploadButton] = useState(false);
    const [handleUpdateButton, setHandleUpdateButton] = useState(false);
    const [handleSubmitButton, setHandleSubmitButton] = useState(true);
    const fileInputRef = useRef(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [deletButton, setDeletButton] = useState();
    const [selectedRows, setSelectedRows] = useState([]);
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
    const formRef = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [formData, setFormData] = useState({
        partcode: "",
        createdby: "",
        updatedby: "",
        productname: "",
        productgroup: "",
        productfamily: ""

    })
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
    const LISTBOX_PADDING = 8;
    const renderRow = ({ data, index, style }) => {
        const option = data[index];
        return (
            <li {...option.props} style={{ ...option.props.style, ...style }}>
                {option.props.children}
            </li>
        );
    };
    const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
        const { children, ...other } = props;
        const itemData = [];

        React.Children.forEach(children, (child) => {
            itemData.push(child);
        });

        const itemCount = itemData.length;
        const itemSize = 36;

        return (
            <div ref={ref} {...other}>
                <FixedSizeList
                    height={300}
                    width="100%"
                    itemSize={itemSize}
                    itemCount={itemCount}
                    itemData={itemData}
                    overscanCount={5}
                >
                    {renderRow}
                </FixedSizeList>
            </div>
        );
    });
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };
    const debouncedSearch = useDebounce(searchText, 500); // delay in ms

    const handleChange = () => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };

    const valiDate = () => {
        const errors = {};
        let isValid = true; // Assume valid initially

        if (!formData.partcode) {
            errors.partcode = "Please Enter partcode";
            isValid = false;
        }

        if (!formData.productname) {
            errors.productname = "Please Enter productname";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid; // Now it correctly returns false if any field is empty
    };
    const exceluploadClear = () => {
        setShowBomTable(true);
        setShowUploadTable(false);
        setHandleUploadButton(false);
        setHandleSubmitButton(true);
    }
    const handleUpload = (event) => {
        setLoading(true);
        setExcelUploadData([]);
        setShowBomTable(false);
        setHandleUpdateButton(false);
        setFormData({ partcode: "", partdescription: "", productname: "", productgroup: "", productfamily: "" });
        setSelectedRows([]);
        setDeletButton(false);
        const file = event.target.files[0];
        if (!file) {
            setLoading(false);
            return;
        }

        if (!file.name.startsWith("BomMaster")) {
            setShowErrorPopup(true);
            setErrorMessage("Invalid file. Please upload BomMaster.xlsx")
            event.target.value = null;
            exceluploadClear();
            setLoading(false);
            return;
        }

        // Yield back to UI first
        setTimeout(function () {
            const reader = new FileReader();

            reader.readAsBinaryString(file);

            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // Validate column headers first
                    const sheetHeaders = jsonData[0]?.map((header) => header.toLowerCase()) || [];
                    const expectedColumns = ["partcode", "partdescription", "productname", "productgroup", "productfamily"];
                    const isValid = expectedColumns.every((col) => sheetHeaders.includes(col));

                    if (!isValid) {
                        setShowErrorPopup(true);
                        setErrorMessage("Invalid column format. Please upload a file with the correct columns")
                        event.target.value = null;
                        exceluploadClear();
                        setLoading(false);
                        return;
                    }
                    // Prepare data ignoring the first row (since it's the header row).
                    const parsedData = XLSX.utils.sheet_to_json(worksheet);
                    if (!parsedData || parsedData.length === 0) {
                        setShowErrorPopup(true);
                        setErrorMessage("No data found in the uploaded file")
                        event.target.value = null;
                        exceluploadClear();
                        setLoading(false);
                        return;
                    }
                    setExcelUploadData(parsedData);
                    setTotalRows(parsedData.length);
                    setHandleUploadButton(true);
                    setHandleSubmitButton(false);
                    setShowUploadTable(true);
                    setShowBomTable(false);
                } catch (error) {
                    console.error("Error processing file:", error);
                } finally {
                    setLoading(false);
                }
            };
            reader.onerror = (error) => {
                console.error("File read error:", error);
                setLoading(false);
            };
        }, 0);
    };


    const handleDownloadExcel = () => {
        // Define the header and data format
        const worksheetData = [
            ["partcode", "partdescription", "productname", "productgroup", "productfamily"]
        ];
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        // Create an Excel file and trigger download
        XLSX.writeFile(workbook, "BomMaster.xlsx");
    };

    const formClear = () => {
        setFormData({ productname: '', partcode: '', createdBy: '', updatedby: '', productgroup: '', productfamily: '' });
        setShowUploadTable(false);
        setHandleUploadButton(false);
        setShowBomTable(true);
        setExcelUploadData([]);
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
        setFileInputKey(Date.now()); // Change key to force re-render
        setSelectedRows([]);
        setDeletButton(false);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            createdby,
            updatedby,
        };
        saveBomMaster(updatedFormData)
            .then((response) => {
                //alert("Product added Successfully");
                setSuccessMessage("Product added Successfully");
                setShowSuccessPopup(true);
                formClear();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        //alert("Product already exists");
                        setShowErrorPopup(true);
                        setErrorMessage("Product already exists")
                    } else {
                        //alert(error.response.status);
                        setShowErrorPopup(true);
                        setErrorMessage(error.response.status)
                    }
                } else {
                    setShowErrorPopup(true);
                    setErrorMessage("Network error, please try again")
                }
            })
            .finally(() => {
                formClear();
            })
    }

    const calculateColumnWidth = (data, key, charWrap = 28, charWidth = 8, minWidth = 190, maxWidth = 318) => {
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


    const calculateColumnWidthExcelUpload = (data, key, charWrap = 19, charWidth = 8, minWidth = 250, maxWidth = 518) => {
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
    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }


    const handlePageChange = (newPage) => {
        setPage(newPage);
    };
    const uploadColumn = useMemo(() => {
        console.log("Recalculating column widths...");
        return [
            {
                name: "Partcode", selector: row => row.partcode, sortable: true, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'partcode')}px`
            },
            {
                name: "partdescription", selector: row => row.partdescription, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'partdescription')}px`
            },
            {
                name: "productname", selector: row => row.productname, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'productname')}px`
            },
            {
                name: "productgroup", selector: row => row.productgroup, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'productgroup')}px`
            },

            {
                name: "productfamily", selector: row => row.productfamily, width: `${calculateColumnWidthExcelUpload(excelUploadData, 'productfamily')}px`
            }
        ]
    }, [excelUploadData]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(bomMaster.map((row) => row.intsysid)); // ✅ Ensure unique selection key
            setDeletButton(true);
            setHandleSubmitButton(false);
            setHandleUpdateButton(false);
            setFormData({ productname: '', partcode: '', createdBy: '', updatedby: '', productgroup: '', productfamily: '' });

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
        setFormData({ partcode: "", partdescription: "", productname: "", productgroup: "", productfamily: "" });
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
            await deleteBom(selectedRows);
            setSuccessMessage("Data successfullly deleted");
            setShowSuccessPopup(true);
            setSelectedRows([]);
            setHandleSubmitButton(true);
            setDeletButton(false);
            fetchBomMaster(page, perPage);
        } catch (error) {
            setErrorMessage("delete error", error);
            setShowErrorPopup(true);

        }
    }
    const column = [
        {
            name: (
                <div style={{ textAlign: 'center', }}>
                    <label>Delete All</label>
                    <br />
                    <input type="checkbox" onChange={handleSelectAll}
                        checked={selectedRows.length === bomMaster.length && bomMaster.length > 0}
                    />
                </div>
            ),
            cell: (row) => (
                <div style={{ paddingLeft: '27px', width: '100%' }}>
                    <input type="checkbox" checked={selectedRows.includes(row.intsysid)} onChange={() => handleRowSelect(row.intsysid)}
                    />
                </div>
            ),
            width: "97px",
            center: true, // ✅ makes both header and cell content centered
        },

        { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "60px" },
        ,
        {
            name: "Partcode",
            selector: row => row.partcode,
            sortable: true,
            width: `${calculateColumnWidth(bomMaster, 'partcode')}px`
        },
        {
            name: "Partdescription",
            selector: row => row.partdescription,
            wrap: true,
            width: `${calculateColumnWidth(bomMaster, 'partdescription')}px`
        },
        {
            name: "productname",
            selector: row => row.productname,
            width: `${calculateColumnWidth(bomMaster, 'productname')}px`
        },
        {
            name: "productGroup",
            selector: row => row.productgroup,
            width: `${calculateColumnWidth(bomMaster, 'productgroup')}px`
        },
        {
            name: "productFamily",
            selector: row => row.productfamily,
            width: `${calculateColumnWidth(bomMaster, 'productfamily')}px`
        }
    ]

    useEffect(() => {
        fetchPartcode();
    }, [])


    const fetchPartcode = () => {
        getPartcode()
            .then((response) => {
                const data = response.data;
                setStoreRc(response.data);
            })
    }

    const fetchProduct = () => {
        getProduct()
            .then((response) => {
                setStoreProduct(response.data)
                console.log("product", response.data);
            })
    }
    useEffect(() => {
        fetchProduct();
    }, [])

    const fetchBomMaster = (page = 1, size = 10) => {
        getBoMaster(page - 1, size)
            .then((response) => {
                setBomMaster(response.data.content || []);
                setTotalRows(response.data.totalElements || 0);

                console.log('fetchBomMaster', response.data);
            })
    }

    const fetchfind = (page = 1, size = 10, search = "") => {
        setLoading(true);
        getBomMasterFind(page - 1, size, search)
            .then((response) => {
                const data = response.data || {};
                setBomMaster(data.content);
                setTotalRows(data.totalElements);
                console.log("search", data.content);
            }).catch((error) => {
                setErrorMessage("data not availbe", error);
                setShowErrorPopup(true);
            }).finally(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch])

    const fetchData = (page = 1, size = 10, search = "") => {
        console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfind(page, size, search);

        } else {
            fetchBomMaster(page, perPage);
        }
    }

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
        const updatedby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = excelUploadData.map(item => ({
            ...item,
            createdby,
            updatedby,
        }));
        saveBomMasterUpload(updatedFormData) // Call bulk API
            .then(() => {
                setSuccessMessage("Products Uploaded Successfully");
                setShowSuccessPopup(true);
                setHandleUploadButton(false);
                setHandleSubmitButton(true);
                setShowUploadTable(false);
                setShowBomTable(true);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        //alert(error.response.data?.error);
                        setErrorMessage(error.response.data?.error);
                        setShowErrorPopup(true);
                        setShowUploadTable(true);
                        setShowBomTable(false);
                    }
                    else {
                        setErrorMessage(error.response.status);
                        setShowErrorPopup(true);
                    }
                } else {
                    setErrorMessage("Network error, please try again");
                    setShowErrorPopup(true);
                }
            });
        setShowBomTable(true);
    }

    const handleEdit = (row) => {
        setFormData(row);
        console.log("Editing Row Data:", row);  // Debugging
        setFormData({
            intsysid: row.intsysid || "",
            partcode: row.partcode || "",
            partdescription: row.partdescription || "",
            productname: row.productname || "",
            productgroup: row.productgroup || "",
            productfamily: row.productfamily || ""
        });
        setHandleSubmitButton(false);
        setHandleUploadButton(false);
        setHandleUpdateButton(true);
        setDeletButton(false);
        setSelectedRows([]);
    };

    const handleUpdate = (e, intsysid) => {
        e.preventDefault();
        if (!valiDate()) return;
        setLoading(true);
        const updatedby = sessionStorage.getItem('userName') || "System";
        const updateFormData = {
            ...formData,
            intsysid,
            updatedby
        };

        updateBomMaster(intsysid, updateFormData)
            .then((response) => {
                setSuccessMessage("BomMaster updated");
                setShowSuccessPopup(true);
                fetchBomMaster(page, perPage);
                formClear();
                setHandleSubmitButton(true);
                setHandleUpdateButton(false);
                setHandleUploadButton(false);
            }).catch((error) => {
                setLoading(false);
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

    const exportToExcel = (search = "") => {
        console.log("searchTeaxt", search)
        if (search && search.trim() !== "") {

            setLoading(true);
            downloadSearchBom(search) // <- pass search here
                .then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "bomMaster.xlsx");
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
            downloadBom()
                .then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "bomMaster.xlsx");
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
                    <h5>BOM Master </h5>
                </div>
                <div className='ComCssUpload'>
                    <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>

                <div className='BomMasterTexfiled'>
                    <ThemeProvider theme={TextFiledTheme}>

                        <Autocomplete
                            disableListWrap
                            ListboxComponent={DropdownCom} // ✅ enable virtualization
                            options={storeRc}
                            getOptionLabel={(option) => option.partcode}
                            isOptionEqualToValue={(option, value) => option.partcode === value.partcode}
                            value={storeRc.find(item => item.partcode === formData.partcode) || null}

                            className='ProductTexfiled-textfield '

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
                                    className='ProductTexfiled-textfield '

                                    helperText={formErrors.partcode}
                                    size="small"
                                    sx={{
                                        "& label.MuiInputLabel-shrink": {
                                            color: "green",
                                            fontWeight: 'bold'
                                        }
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.partcode}>
                                    {option.partcode}
                                </li>
                            )}
                        />

                        <Autocomplete
                            options={storeRc}
                            // disableListWrap
                            ListboxComponent={DropdownCom} // ✅ enable virtualization
                            PopperComponent={CustomPopper} // ✅ Set dropdown width
                            className='ProductTexfiled-textfield '
                            getOptionLabel={(option) => option.partdescription}
                            isOptionEqualToValue={(option, value) => option.partdescription === value.partdescription}
                            getOptionKey={(option) => option.partdescription} // Optional but safe for custom rendering
                            value={storeRc.find(item => item.partdescription === formData.partdescription) || null}
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
                                    label="partdescription"
                                    variant="outlined"

                                    size="small"
                                    sx={{
                                        "& label.MuiInputLabel-shrink": {
                                            color: "green", // label color when floated
                                            fontWeight: 'bold',
                                            width: "500px"


                                        }
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.partdescription}>
                                    {option.partdescription}
                                </li>
                            )}
                        />
                        <Autocomplete
                            options={storeProduct}
                            getOptionLabel={(option) => option.productName}
                            value={storeProduct.find(item => item.productName === formData.productname) || null}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData({
                                        ...formData,
                                        productname: newValue.productName,
                                        productgroup: newValue.productGroup,
                                        productfamily: newValue.productFamily,

                                    });
                                } else {
                                    setFormData({ ...formData, productname: "", productgroup: "", productfamily: "" });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="productname"
                                    variant="outlined"
                                    error={Boolean(formErrors.productname)}
                                    helperText={formErrors.productname}
                                    className='ProductTexfiled-textfield '

                                    size="small"
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
                            label="productGroup"
                            variant="outlined"
                            name="productgroup"
                            value={formData.productgroup}
                            className='ProductTexfiled-textfield '

                            onChange={handleChange}
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
                            label="productFamily"
                            variant="outlined"
                            name="productfamily"
                            value={formData.productfamily}
                            className='ProductTexfiled-textfield '
                            onChange={handleChange}
                            size="small"
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
                    {handleSubmitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
                    {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.intsysid)}>Update</button>}
                    {handleUploadButton && <button style={{ backgroundColor: 'orange' }} onClick={handleExcelUpload}>Upload</button>}
                    {deletButton && <button style={{ backgroundColor: 'orange' }} onClick={onDeleteClick}   >Delete</button>}
                    <button onClick={formClear}>Clear</button>
                </div>
            </div>
            <div className='ComCssTable'>
                {showBomTable && !showUploadTable && (
                    <h5 className='ComCssTableName'>BOM Master Detail</h5>
                )}

                {showUploadTable && !showBomTable && (
                    <h5 className='ComCssTableName'>Upload Master deatil</h5>
                )}

                {showBomTable && !showUploadTable && (
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
                )}
                {showBomTable && !showUploadTable && (
                    <DataTable
                        columns={column}
                        data={bomMaster}
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
                    // conditionalRowStyles={rowHighlightStyle}

                    />
                )}

                {showUploadTable && !showBomTable && (
                    <DataTable
                        columns={uploadColumn}
                        data={excelUploadData}
                        pagination
                        paginationServer
                        progressPending={loading}
                        paginationTotalRows={totalRows}
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        paginationPerPage={perPage}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
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
                        // conditionalRowStyles={rowHighlightStyle}
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

export default BomMaster