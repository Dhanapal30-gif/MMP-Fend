import React, { useState, useMemo, useRef, useEffect } from 'react'

import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import "./Approval.css";
import { FaFileExcel } from "react-icons/fa";
import { deleteApproval, deleteBom, downloadBom, downloadSearchBom, fetchApproval, fetchProdcutDetail, getBoMaster, getBomMasterFind, getPartcode, getProduct, getUserMailId, saveApprovalMaster, saveBomMaster, saveBomMasterUpload, updateApproval, updateBomMaster, uploadApprovalMaster } from '../../Services/Services';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { FaEdit } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';

const ApprovalMaster = () => {
    const [formErrors, setFormErrors] = useState({});
    const [excelUploadData, setExcelUploadData] = useState([]);
    const [handleUploadButton, setHandleUploadButton] = useState(false);
    const [handleUpdateButton, setHandleUpdateButton] = useState(false);
    const [handleSubmitButton, setHandleSubmitButton] = useState(true);
    const fileInputRef = useRef(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const [deletButton, setDeletButton] = useState();
    const [selectedRows, setSelectedRows] = useState([]);
    const [approvalMaster, setApprovalMaster] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [showApprovalTable, setShowApprovalTable] = useState(true);
    const [perPage, setPerPage] = useState(10);
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
    const [storeUserId, setStoreUserId] = useState([]);
    const [formData, setFormData] = useState({
        requesttype: '',
        issuancetype: "",
        componenttype: "",
        productgroup: [],
        approver1: [],
        approver2: [],
        createdby: "",
        updatedby: ""
    })

    const handleChange = () => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }

    const Validate = () => {
        const errors = {};
        let isVlaid = true;

        if (!formData.requesttype) {
            errors.requesttype = "please select requestType";
            isVlaid = false;
        }
        if (!formData.approver1 || formData.approver1.length === 0) {
            errors.approver1 = "please select approver1";
            isVlaid = false;
        }
        if (!(formData.requesttype === "Returning" && formData.issuancetype === "PTL" || formData.requesttype==="PTL Request")) {

        if (!formData.approver2 || formData.approver2.length === 0) {
            errors.approver2 = "please select approver2";
            isVlaid = false;
        }
    }
        if (formData.requesttype == "Material Request") {
            if (formData.issuancetype === "DTL") {
                if (!formData.issuancetype) {
                    errors.issuancetype = "please select issuancetype"
                    isVlaid = false;
                }
            }
        }
        if (formData.requesttype == "Material Request") {
            if (formData.issuancetype === "DTL") {

                if (!formData.componenttype) {
                    errors.componenttype = "please select componenttype"
                    isVlaid = false;
                }
            }
        }
        if (formData.requesttype == "Material Request") {
            if (formData.issuancetype === "DTL") {

                if (!formData.productgroup || formData.productgroup.length === 0) {
                    errors.productgroup = "Please select product group";
                    isVlaid = false;
                }
            }
        }
        if (formData.requesttype == "Material Request") {
            if (formData.issuancetype === "DTL") {

                if (!formData.approver1 || formData.approver1.length === 0) {
                    errors.approver1 = "Please select product group";
                    isVlaid = false;
                }
            }
        }
        if (formData.requesttype == "Material Request") {
            if (formData.issuancetype === "DTL") {
                if (!formData.approver2 || formData.approver2.length === 0) {
                    errors.approver2 = "Please select product group";
                    isVlaid = false;
                }
            }
        }

       
        setFormErrors(errors);
        return isVlaid;
    }

    const componentOptions = [
        {
            label: (
                <>
                    Others (
                    <span style={{ fontSize: "12px",fontWeight:'bold', color: "red" }}>
                          ,Mechanical Assembly, Raw Material, OGI
                    </span>
                    )
                </>
            ),
            value: "others",
        },
        { label: "Thermal Gel", value: "thermal" },
        { label: "Submodule", value: "submodule" },
    ];

    const formClear = () => {
        setFormData({ requesttype: '', issuancetype: '', componenttype: '', productgroup: '', approver1: '', approver2: '' });
        setShowUploadTable(false);
        setHandleUploadButton(false);
        setShowApprovalTable(true);
        setExcelUploadData([]);
        setHandleSubmitButton(true);
        setHandleUpdateButton(false);
        setFileInputKey(Date.now()); // Change key to force re-render
        setSelectedRows([]);
        setDeletButton(false);
    }

    useEffect(() => {
        getProductDetail();
        getLoginEmailId();
        fetchApprovalMaster();
    }, [])

    const getProductDetail = () => {
        fetchProdcutDetail()
            .then((response) => {
                setStoreProduct(response.data);
                // console.log("product", response.data);
            })
    }
    const getLoginEmailId = () => {
        getUserMailId()
            .then((response) => {
                setStoreUserId(response.data);
            })
    }

    const fetchApprovalMaster = () => {
        fetchApproval()
            .then(response => {
                const data = response.data.data || [];
                setApprovalMaster(data);
                setTotalRows(data.length); // ✅ use data.length, not approvalMaster.length
                console.log("fetchCurrency", data.length);
            });

    }
    const uniqueProductGroup = [
        ...new Map(storeProduct.map(item => [item.ProductGroup, item])).values()
    ];

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!Validate()) return; // Stop execution if validation fails
        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            createdby,
            updatedby,
            //lineLead: [],
            //productEngineer: [],
            productgroup: (formData.productgroup || []).map(g => g?.ProductGroup || g).join(","),
            approver1: (formData.approver1 || []).map(g => g?.approver1 || g).join(","),
            approver2: (formData.approver2 || []).map(g => g?.approver2 || g).join(",")
        };
if (formData.requesttype === "Returning" && formData.issuancetype === "PTL") {
    delete updatedFormData.approver2;
  }
        saveApprovalMaster(updatedFormData)
            .then((response) => {
                const data = response.data;
                if (data.success) {
                    setSuccessMessage(data.message || "Product Updated Successfully");
                    setShowSuccessPopup(true);
                    setFormData({ requesttype: "", issuancetype: "", componenttype: "", productgroup: [], approver1: [], approver2: [] });
                    fetchApprovalMaster();
                } else {
                    setErrorMessage(data.message || "Unknown error");
                    setShowErrorPopup(true);
                }
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                } else {
                    setErrorMessage("Network error, please try again");
                }
                setShowErrorPopup(true);
            });
    };

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
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(approvalMaster.map((row) => row.id)); // ✅ Ensure unique selection key
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
        // console.log("selectedRows", selectedRows);
    }, [selectedRows]);

    const handleRowSelect = (rowKey) => {
        setHandleUpdateButton(false);
        // setFormData({ partcode: "", partdescription: "", productname: "", productgroup: "", productfamily: "" });
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
                <div style={{ textAlign: 'center', marginLeft: '10px' }}>
                    <label>Select</label>
                    <br />
                    <input type="checkbox" onChange={handleSelectAll}
                        checked={selectedRows.length === approvalMaster.length && approvalMaster.length > 0}
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
        { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)} ><FaEdit /></button>), width: "79px" },
        ,
        {
            name: "Request Type",
            selector: row => row.requesttype,
            sortable: true,
            width: `${calculateColumnWidth(approvalMaster, 'Requesttype')}px`
        },
        {
            name: "Issuance Type",
            selector: row => row.issuancetype,
            wrap: true,
            width: `${calculateColumnWidth(approvalMaster, 'issuancetype')}px`
        },
        {
            name: "Component Type",
            selector: row => row.componenttype,
            width: `${calculateColumnWidth(approvalMaster, 'Componenttype')}px`
        },
        {
            name: "Product Group",
            selector: row => row.productgroup,
            width: `${calculateColumnWidth(approvalMaster, 'Productgroup')}px`
        },
        {
            name: "Approver1",
            selector: row => row.approver1
                ? row.approver1.split(",").map(email => <div key={email}>{email}</div>)
                : "", width: `${calculateColumnWidth(approvalMaster, 'Approver1')}`,
            wrap: true,
        },
        {
            name: "Approver2",
            selector: row => row.approver2
                ? row.approver2.split(",").map(email => <div key={email}>{email}</div>)
                : "", width: `${calculateColumnWidth(approvalMaster, 'Approver2')}`,
            wrap: true,
        }
    ]

    const conditionalRowStyles = [
        {
            when: row => row.rowIndex % 2 === 0,
            style: {
                backgroundColor: "#ffffff" // white
            },
        },
        {
            when: row => row.rowIndex % 2 !== 0,
            style: {
                backgroundColor: "#f2f2f2" // light gray
            },
        },
    ];
    const uploadColumn = useMemo(() => {
        return [
            {
                name: "Requesttype",
                selector: row => row.requesttype,
                sortable: true,
                width: `${calculateColumnWidth(approvalMaster, 'Requesttype')}px`
            },
            {
                name: "issuancetype",
                selector: row => row.issuancetype,
                wrap: true,
                width: `${calculateColumnWidth(approvalMaster, 'issuancetype')}px`
            },
            {
                name: "Componenttype",
                selector: row => row.componenttype,
                width: `${calculateColumnWidth(approvalMaster, 'Componenttype')}px`
            },
            {
                name: "Productgroup",
                selector: row => row.productgroup,
                width: `${calculateColumnWidth(approvalMaster, 'Productgroup')}px`
            }, {
                name: "Approver1",
                selector: row => row.approver1,
                width: `${calculateColumnWidth(approvalMaster, 'Approver1')}px`
            }, {
                name: "Approver2",
                selector: row => row.approver2,
                width: `${calculateColumnWidth(approvalMaster, 'Approver2')}px`
            }
        ]
    }, [excelUploadData]);

    const handleDownloadExcel = () => {
        const worksheetData = [
            ["requesttype", "issuancetype", "componenttype", "productgroup", "approver1", "approver2"]
        ];
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet,);

        // Create an Excel file and trigger download
        XLSX.writeFile(workbook, "ApprovalMaster.xlsx");
    };
    const exceluploadClear = () => {
        setShowApprovalTable(true);
        setShowUploadTable(false);
        setHandleUploadButton(false);
        setHandleSubmitButton(true);
    }
    const handleUpload = (event) => {
        setLoading(true);
        setExcelUploadData([]);
        setShowApprovalTable(false);
        setHandleUpdateButton(false);
        setHandleUploadButton(true);
        //setFormData({ partcode: "", partdescription: "", productname: "", productgroup: "", productfamily: "" });
        setSelectedRows([]);
        setDeletButton(false);
        const file = event.target.files[0];
        if (!file) {
            setLoading(false);
            return;
        }
        if (!file.name.startsWith("ApprovalMaster")) {
            setShowErrorPopup(true);
            setErrorMessage("Invalid file. Please upload BomMaster.xlsx")
            event.target.value = null;
            exceluploadClear();
            setLoading(false);
            return;
        }
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
                    const expectedColumns = ["requesttype", "issuancetype", "componenttype", "productgroup", "approver1", "approver2"];
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
                    setShowApprovalTable(false);
                } catch (error) {
                    console.error("Error processing file:", error);
                } finally {
                    setLoading(false);
                }
            };
            reader.onerror = (error) => {
                // console.error("File read error:", error);
                setLoading(false);
            };
        }, 0);
    };

    const handleExcelUpload = (e) => {
        e.preventDefault();
        const errors = [];
        excelUploadData.slice(1).forEach((row) => {
            if (!row.requesttype || row.requesttype.trim() === "") {
                errors.push("Product Name is required");
            }
        });
        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = excelUploadData.map(item => ({
            ...item,
            createdby,
            updatedby,

        }));
        uploadApprovalMaster(updatedFormData) // Call bulk API
            .then((response) => {
                const data = response.data;
                if (data.success) {
                    setSuccessMessage(data.message || "Product upload Successfully");
                    setShowSuccessPopup(true);
                    setHandleUploadButton(false);
                    setHandleSubmitButton(true);
                    setShowUploadTable(false);
                    setShowBomTable(true);
                    setFormData({ requesttype: "", issuancetype: "", componenttype: "", productgroup: [], approver1: [], approver2: [] });
                    fetchApprovalMaster();
                } else {
                    setErrorMessage(data.message || "Unknown error");
                    setShowErrorPopup(true);
                }
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {
                    setErrorMessage(error.response.data.message);
                    setShowUploadTable(true);
                    setShowApprovalTable(false);
                } else {
                    setErrorMessage("Network error, please try again");
                    setShowUploadTable(true);
                    setShowApprovalTable(false);
                }
                setShowErrorPopup(true);
                //setShowApprovalTable(true);
            });
    }


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
        setConfirmDelete(false);

        try {
            await deleteApproval(selectedRows);
            setSuccessMessage("Data successfullly deleted");
            setShowSuccessPopup(true);
            setSelectedRows([]);
            setHandleSubmitButton(true);
            setDeletButton(false);
            fetchApprovalMaster();
            setSearchText("");
        } catch (error) {
            setErrorMessage("delete error", error);
            setShowErrorPopup(true);

        }
    }

    const handleUpdate = (e, id) => {
        e.preventDefault();
        if (!Validate()) return;
        setLoading(true);
        const updatedby = sessionStorage.getItem('userName') || "System";
        const updateFormData = {
            ...formData,
            id,
            updatedby,
            productgroup: (formData.productgroup || []).map(g => g?.ProductGroup || g).join(","),
            approver1: (formData.approver1 || []).map(g => g?.approver1 || g).join(","),
            approver2: (formData.approver2 || []).map(g => g?.approver2 || g).join(",")
        };

        updateApproval(id, updateFormData)
            .then((response) => {
                setSuccessMessage("Approval updated");
                setShowSuccessPopup(true);
                fetchApprovalMaster();
                formClear();
                setHandleSubmitButton(true);
                setHandleUpdateButton(false);
                setHandleUploadButton(false);
                fetchApprovalMaster();
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
    const handleEdit = (row) => {
        setFormData(row);
        // console.log("Editing Row Data:", row);  // Debugging
        setFormData({
            id: row.id || "",
            requesttype: row.requesttype || "",
            issuancetype: row.issuancetype || "",
            componenttype: row.componenttype || "",
            productgroup: Array.isArray(row.productgroup) ? row.productgroup : [row.productgroup].filter(Boolean),
            approver1: Array.isArray(row.approver1) ? row.approver1 : [row.approver1].filter(Boolean),
            approver2: Array.isArray(row.approver2) ? row.approver2 : [row.approver2].filter(Boolean)
        });

        setHandleSubmitButton(false);
        setHandleUploadButton(false);
        setHandleUpdateButton(true);
        setDeletButton(false);
        setSelectedRows([]);
    };

    const filteredData = approvalMaster.filter(row =>
        Object.values(row).some(value =>
            typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
        )
    );
    const paginatedData = filteredData.slice(
        (page - 1) * perPage,
        page * perPage
    );
    // const uploadPaginatedData = uploadFilteredData.slice(
    //     (page - 1) * perPage,
    //     page * perPage
    // );
    const filteredApproval = approvalMaster.filter(Approval =>
        Approval.requesttype?.toLowerCase().includes(searchText.toLowerCase()) ||
        Approval.issuancetype?.toLowerCase().includes(searchText.toLowerCase()) ||
        Approval.componenttype?.toLowerCase().includes(searchText.toLowerCase()) ||
        Approval.productgroup?.toLowerCase().includes(searchText.toLowerCase()) ||
        Approval.approver1?.toLowerCase().includes(searchText.toLowerCase()) ||
        Approval.approver2?.toLowerCase().includes(searchText.toLowerCase())

    );
    const paginatedDataWithIndex = paginatedData.map((row, index) => ({
        ...row,
        rowIndex: index
    }));
    const exportToExcel = (searchText = "") => {
        if (searchText && searchText.trim() !== "") {
            if (!Array.isArray(approvalMaster) || filteredApproval.length === 0) {
                // console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(filteredApproval);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "ApprovalMaster.xlsx");

        } else {
            if (!Array.isArray(approvalMaster) || approvalMaster.length === 0) {
                // console.warn("No data to export.");
                return;
            }
            const sheet = XLSX.utils.json_to_sheet(approvalMaster);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, sheet, "Vendors");
            XLSX.writeFile(workbook, "ApprovalMaster.xlsx");
        }
    };

    console.log("formData", formData)
    return (
        <div className='COMCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Approval Master </p>
                </div>
                <div className='ComCssUpload'>
                    <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" style={{ display: 'none' }} onChange={handleUpload} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <div className='ProductTexfiled'>
                    <ThemeProvider theme={TextFiledTheme}>

                        <Autocomplete
                            options={["Material Request", "Scrap Request", "Stock Transfer Request", "Material Request Projects","Stock Transfer ","Returning","PTL Request"]}
                            getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
                            value={formData.requesttype || []}
                            onChange={(event, newValue) => {
                                setFormData({
                                    ...formData,
                                    requesttype: newValue || "",
                                    issuancetype: "",
                                    componenttype: "",
                                    productgroup: [],
                                    approver1: [],
                                    approver2: []
                                });
                            }} renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Request Type"
                                    variant="outlined"
                                    error={Boolean(formErrors.requesttype)}
                                    helperText={formErrors.requesttype}
                                    size="small"  // <-- Reduce height
                                    className='ProductTexfiled-textfield '

                                />
                            )}
                        />
                        {formData.requesttype === "Material Request" || formData.requesttype==="Returning" && (
                            <Autocomplete
                                options={["DTL", "PTL"]}
                                getOptionLabel={(option) => (typeof option === "string" ? option : "")} // ✅ Ensure it's a string
                                value={formData.issuancetype || []}
                                onChange={(event, newValue) => setFormData({ ...formData, issuancetype: newValue || [] })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Requesttype"
                                        variant="outlined"
                                        error={Boolean(formErrors.issuancetype)}
                                        helperText={formErrors.issuancetype}
                                        size="small"  // <-- Reduce height
                                        className='ProductTexfiled-textfield '
                                    />
                                )}
                            />

                        )}
                        {(formData.requesttype === "Material Request" && formData.issuancetype !== "PTL") && (
                            <Autocomplete
                                options={componentOptions}
                                getOptionLabel={(option) =>
                                    typeof option === "string" ? option : option.value
                                }
                                value={
                                    componentOptions.find((opt) => opt.value === formData.componenttype) || null
                                }
                                onChange={(event, newValue) => {
                                    const selectedType = newValue?.value || "";

                                    // If user changes to "submodule" or "thermal gel" after "others"
                                    const shouldReset =
                                        selectedType === "submodule" || selectedType === "thermal" || selectedType === "others" || selectedType === "PTL";

                                    setFormData({
                                        ...formData,
                                        componenttype: selectedType,
                                        productgroup: shouldReset ? [] : formData.productgroup,
                                        approver1: shouldReset ? [] : formData.approver1,
                                        approver2: shouldReset ? [] : formData.approver2,
                                    });
                                }}
                                renderOption={(props, option) => <li {...props}>{option.label}</li>}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="componenttype"
                                        variant="outlined"
                                        error={Boolean(formErrors.componenttype)}
                                        helperText={formErrors.componenttype}
                                        size="small"
                                        className='ProductTexfiled-textfield '
                                    />
                                )}
                            />
                        )}
                        {formData.requesttype == "Material Request" && formData.issuancetype !== "PTL" && (
                            <Autocomplete
                                multiple
                                options={uniqueProductGroup}
                                getOptionLabel={(option) =>
                                    typeof option === "string" ? option : option.ProductGroup || ""
                                }
                                value={formData.productgroup || []} // ✅ Must be array of objects
                                onChange={(event, newValue) => {
                                    const selectedGroups = newValue || [];
                                    const selectedGroupNames = selectedGroups
                                        .map(g => g?.ProductGroup)
                                        .filter(Boolean); // ✅ safe map

                                    const matched = storeProduct.filter(item =>
                                        selectedGroupNames.includes(item.ProductGroup)
                                    );

                                    const validLineLeads = matched
                                        .map(item => item.lineLead)
                                        .filter(v => v && v !== "null");

                                    const validEngineers = matched
                                        .map(item => item.productEngineer)
                                        .filter(v => v && v !== "null");

                                    const updatedData = {
                                        ...formData,
                                        productgroup: selectedGroupNames, // ✅ send object array as Autocomplete value
                                        approver1: [],
                                        approver2: []
                                    };

                                    if (formData.componenttype === "others") {
                                        updatedData.approver1 = [...new Set(validLineLeads)];
                                    } else if (formData.componenttype === "submodule") {
                                        updatedData.approver1 = [...new Set(validEngineers)];
                                    }

                                    setFormData(updatedData);
                                }}
                                isOptionEqualToValue={(option, value) =>
                                    option.ProductGroup === value.ProductGroup
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Group"
                                        variant="outlined"
                                        error={Boolean(formErrors.productgroup)}
                                        helperText={formErrors.productgroup}
                                        size="small"
                                        className='ProductTexfiled-textfield '
                                    />
                                )}
                            />
                        )}

                        <Autocomplete
                            multiple
                            options={formData.componenttype === "others" || formData.componenttype === "submodule" ? [] : storeUserId} // ✅ hide dropdown if "others"
                            getOptionLabel={(option) => option}
                            disableClearable={formData.componenttype === "others" || formData.componenttype === "submodule"} // 🔒 don't allow clearing if auto-fetched
                            value={formData.approver1 || []}
                            isOptionEqualToValue={(option, value) => option === value}
                            onChange={(event, newValue) => {
                                if (formData.componenttype !== "others" || formData.componenttype === "submodule") {
                                    setFormData({ ...formData, approver1: newValue || [] });
                                }
                            }} renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Approver1"
                                    variant="outlined"
                                    error={Boolean(formErrors.approver1)}
                                    helperText={formErrors.approver1}
                                    size="small"  // <-- Reduce height
                                    className='ProductTexfiled-textfield '
                                />
                            )}
                        />
                        {/* {formData.requesttype !== "Returning"  && formData.issuancetype !== "PTL" && ( */}
{!(formData.requesttype === "Returning" && formData.issuancetype === "PTL" ||formData.requesttype==="PTL Request") && (

                        <Autocomplete
                            multiple
                            options={storeUserId}
                            getOptionLabel={(option) => option} // ✅ Ensure it's a string
                            value={formData.approver2 || []}
                            onChange={(event, newValue) => setFormData({ ...formData, approver2: newValue || [] })}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Approver2"
                                    variant="outlined"
                                    error={Boolean(formErrors.approver2)}
                                    helperText={formErrors.approver2}
                                    size="small"  // <-- Reduce height
                                    className='ProductTexfiled-textfield '
                                />
                            )}
                        /> )}
                    </ThemeProvider>
                </div>
                <div className='ComCssButton9'>
                    {handleSubmitButton && <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>}
                    {handleUpdateButton && <button sclassName='ComCssUpdateButton' onClick={(e) => handleUpdate(e, formData.id)}>Update</button>}
                    {handleUploadButton && <button className='ComCssExcelUploadButton' onClick={handleExcelUpload}>Upload</button>}
                    {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}
                    <button className='ComCssClearButton' onClick={formClear}>Clear</button>
                </div>
            </div>
            <div className='ComCssTable'>
                {showApprovalTable && !showUploadTable && (
                    <h5 className='ComCssTableName'>Approval Detail</h5>
                )}
                {showUploadTable && !showApprovalTable && (
                    <h5 className='ComCssTableName'>Upload Master deatil</h5>
                )}
                {showApprovalTable && !showUploadTable && (
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                        <button className="btn btn-success" onClick={() => exportToExcel(searchText)} style={{ fontSize: '13px', backgroundColor: 'green' }}>
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
                {showApprovalTable && !showUploadTable && (
                    <DataTable
                        columns={column}
                        data={paginatedDataWithIndex}
                        conditionalRowStyles={conditionalRowStyles} // ✅ add this line
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
                            // headRow: {
                            //     style: {
                            //         background: "linear-gradient(to bottom, rgb(37, 9, 102), rgb(16, 182, 191))",
                            //         color: "white",
                            //         fontWeight: "bold",
                            //         fontSize: "14px",
                            //         textAlign: "center",
                            //         minHeight: "50px",
                            //     },
                            // },
                            // rows: {
                            //     style: {
                            //         fontSize: "14px",
                            //         textAlign: "center",
                            //         alignItems: "center", // Centers content vertically
                            //         fontFamily: "Arial, Helvetica, sans-serif",
                            //     },
                            // },
                            // cells: {
                            //     style: {
                            //         padding: "5px",  // Removed invalid negative padding
                            //         //textAlign: "center",
                            //         justifyContent: "center",  // Centers header text
                            //         whiteSpace: 'pre-wrap', // wrap text
                            //         wordBreak: 'break-word', // allow breaking words
                            //     },
                            // },
                            // headCells: {
                            //     style: {
                            //         display: "flex",
                            //         justifyContent: "center",  // Centers header text
                            //         alignItems: "left",
                            //         textAlign: "left",
                            //         whiteSpace: 'pre-wrap',
                            //         wordBreak: 'break-word',
                            //     },
                            // },
                            // pagination: {
                            //     style: {
                            //         border: "1px solid #ddd",
                            //         backgroundColor: "#f9f9f9",
                            //         color: "#333",
                            //         minHeight: "35px",
                            //         padding: "5px",
                            //         fontSize: "12px",
                            //         fontWeight: "bolder",
                            //         display: "flex",
                            //         justifyContent: "flex-end", // Corrected
                            //         alignItems: "center", // Corrected
                            //     },
                            // },
                        }}
                    />
                )}
                {showUploadTable && !showApprovalTable && (
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
                severity="success" // ✅ Green message
                color="primary"
            />
            <CustomDialog
                open={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                title="Error"
                message={errorMessage}
                severity="error" // ✅ Green message
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

export default ApprovalMaster