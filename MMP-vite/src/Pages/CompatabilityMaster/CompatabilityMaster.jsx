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
import CompatabilityAddTable from "../../components/CompatabilityMaster/CompatabilityAddTable";
import CompatabilityDefaultTable from "../../components/CompatabilityMaster/CompatabilityDefaultTable";
import { fetchCompatabilityDetail } from "../../components/CompatabilityMaster/CompatabilityAction";
import { deleteCompatability, saveCompatability } from '../../Services/Services-Rc';
import CompatabilityUploadTable from "../../components/CompatabilityMaster/CompatabilityUploadTable";
import { downloadComMaster } from '../../Services/Services_09';


const CompatabilityMaster = () => {
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
    const [compatabilityData, setCompatabilityData] = useState([]);
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
    const [page, setPage] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [vendorMaster, setVendorMaster] = useState([]);
    const [curencyMaster, setCurencyMaster] = useState([]);
    const [rcMainStore, setRcMainStore] = useState([]);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [downloadDone, setDownloadDone] = useState(false);
    const [updateButton, setUpdateButton] = useState(false);
    const [addButton, setAddButton] = useState(true)
    const [resetKey, setResetKey] = useState(0);

    const [formData, setFormData] = useState({
        parentpartcode: "",
        parentpartdescription: "",
        partcode: "",
        partdescription: ""
    })

    const [table1Page, setTable1Page] = useState(1);
    const [table1PerPage, setTable1PerPage] = useState(10);
    const [table1TotalRows, setTable1TotalRows] = useState(0);


    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);
    const handleTable1PageChange = (table1Page) => setTable1Page(table1Page);
    const handleTable1PerRowsChange = (newPerPage, page) => setTable1PerPage(newPerPage);

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
    const CustomPopper = (props) => (
        <Popper
            {...props}
            style={{
                ...props.style,
                width: '700px' // ✅ Your desired dropdown width
            }}
            placement="bottom-start"
        />
    );

    const formClear = () => {
        setFormData({
            parentpartcode: "", parentartdiscription: "",
            partcode: "",
            partdiscription: ""
        })
        setFormErrors({});
        setAddButton(true);
        setUpdateButton(false)
        setSelectedRows([]);
        setDeletButton(false)
    }

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.parentpartcode) {
            errors.parentpartcode = "please select Parent Partcode";
            isValid = false;
        }

        if (!formData.partcode) {
            errors.partcode = "please select Compatability partcode";
            isValid = false;
        }


        setFormErrors(errors);
        return isValid;
    }
    const handleAddClick = () => {
        if (!valiDate()) return;

        const isDuplicate = tableData.some(
            (item) =>
                item.parentpartcode === formData.parentpartcode &&
                item.parentpartdescription === formData.parentpartdescription &&
                item.partcode === formData.partcode &&
                item.partdescription === formData.partdescription
        );

        if (isDuplicate) {
            setErrorMessage("Same Parent and Compatibility combination already exists!");
            setShowErrorPopup(true);
            return;
        }

        setShowTable(true);
        setTableData((prev) => [...prev, formData]);
        setFormData({
            parentpartcode: "",
            parentpartdescription: "",
            partcode: "",
            partdescription: ""
        });
    };


    const cancelTableData = () => {
        setTableData([]);
        setExcelUploadData([]);
        setShowUploadTable(false);
        setShowTable(false);
        setFormData(prev => ({
            ...prev,
            partcode: "",
            partdescription: "",
            parentpartdescription: "",
            parentpartcode: ""

        }));
    }

    // const fetchCompatability = async (page, perPage, search) => {
    //     setLoading(true);
    //     const userId = sessionStorage.getItem("userName") || "System";

    //     try {
    //         await fetchCompatabilityDetail(page, perPage, search, setCompatabilityData, setTotalRows);
    //     } catch (err) {
    //         console.error("Error fetching putaway data:", err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };

    const debouncedSearch = useDebounce(searchText, 500);

    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch]);

    const fetchData = async (page, perPage, search = "") => {
        setLoading(true); // start loader
        try {
            await fetchCompatabilityDetail(page, perPage, search, setCompatabilityData, setTotalRows);
        } catch (err) {
            console.error("Error fetching putaway data:", err);
        } finally {
            setLoading(false); // stop loader after API finishes
        }
    };

    const handleUpdate = async () => {
        if (!valiDate()) return;
        setLoading(true);

        try {
            const userName = sessionStorage.getItem("userId") || "System";

            // Determine if formData is a single object or an array
            // let payload = Array.isArray(formData)
            //     ? formData.map((row) => ({ ...row, modifiedby: userName }))
            //     : [{ ...formData, modifiedby: userName }];
            let payload = Array.isArray(formData)
                ? formData.map((row) => ({
                    id: row.id,
                    partcode: row.partcode,
                    parentpartcode: row.parentpartcode,
                    partdescription: row.partdescription,
                    parentpartdescription: row.parentpartdescription,
                    modifiedby: userName
                }))
                : [{
                    id: formData.id,
                    partcode: formData.partcode,
                    parentpartcode: formData.parentpartcode,
                    partdescription: formData.partdescription,
                    parentpartdescription: formData.parentpartdescription,
                    modifiedby: userName
                }];

            const response = await saveCompatability(payload);

            if (response?.status === 200 && response.data) {
                const { message } = response.data;
                setSuccessMessage(message || "Saved successfully");
                setShowSuccessPopup(true);
                setTableData([]);
                setShowTable(false);
                setShowUploadTable(false);
                setExcelUploadData([]);
                fetchData();
                formClear();
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error.message;
            setErrorMessage(errMsg);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async () => {
        setLoading(true);

        try {
            const userName = sessionStorage.getItem("userId") || "System";
            let updatedFormData = [];
            if (showTable) {

                updatedFormData = tableData.map((row) => ({
                    ...row,
                    createdby: userName,
                    modifiedby: userName,

                }));

            }
            else if (showUploadTable) {
                updatedFormData = excelUploadData.map((row) => ({
                    ...row,
                    createdby: userName,
                    modifiedby: userName,

                }));
            }


            if (updatedFormData.length === 0) {
                setErrorMessage("No data to submit");
                setShowErrorPopup(true);
                return;
            }

            const response = await saveCompatability(updatedFormData);

            if (response?.status === 200 && response.data) {
                const { message } = response.data;
                setSuccessMessage(message || "Saved successfully");
                setShowSuccessPopup(true);
                setTableData([]);
                setShowTable(false);
                setShowUploadTable(false);
                setExcelUploadData([]);
                setResetKey(prev => prev + 1);  
                fetchData();
            } else {
                setErrorMessage(response.data?.message || "Something went wrong");
                setShowErrorPopup(true);
            }
        } catch (error) {
            const errMsg = error?.response?.data?.message || error.message;
            setErrorMessage(errMsg);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = () => {
        const worksheetData = [
            ["parentpartcode", "partcode"]
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        XLSX.writeFile(workbook, "CompatabilityMaster.xlsx");
    };

    const handleUpload = (event) => {
        setLoading(true);
        setExcelUploadData([]);
        setFormData({ parentpartcode: "", partcode: "" });
        const file = event.target.files[0];
        if (!file) {
            setLoading(false);
            return;
        }

        if (!file.name.startsWith("CompatabilityMaster")) {
            setShowErrorPopup(true);
            setErrorMessage("Invalid file. Please upload BomMaster.xlsx")
            event.target.value = null;
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

                    const sheetHeaders = jsonData[0]?.map((header) => header.toLowerCase()) || [];
                    const expectedColumns = ["parentpartcode", "partcode"];
                    const isValid = expectedColumns.every((col) => sheetHeaders.includes(col));

                    if (!isValid) {
                        setShowErrorPopup(true);
                        setErrorMessage("Invalid column format. Please upload a file with the correct columns")
                        event.target.value = null;
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
                    setShowTable(false)
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
    const [editingRowId, setEditingRowId] = useState(null);
    // const [data, setData] = useState([]);

    const handleEditClick = (row) => {
        setUpdateButton(true)
        setAddButton(false)
        setHandleUploadButton(false)
        setDeletButton(false)
        setSelectedRows([]);
        setEditingRowId(row.id);

        // setFormData(prev => ({
        //     ...prev, // keep previous data if missing in row
        //     id: row.id ?? prev.id ?? "",
        //     partcode: row.partcode ?? prev.partcode ?? "",
        //     partdescription: row.partdescription ?? prev.partdescription ?? "",
        //     parentpartcode: row.parentpartcode ?? prev.parentpartcode ?? "",
        //     parentpartdescription: row.parentpartdescription ?? prev.parentpartdescription ?? "",
        // }));

        setFormData(prev => ({
            ...prev, // keep previous data if missing in row
            id: row.id ?? prev.id ?? "",
            partcode: row.partcode,
            partdescription: row.partdescription,
            parentpartcode: row.parentpartcode,
            parentpartdescription: row.parentpartdescription,
        }));
        setFormErrors({});

        // setData([{ ...row, selectedid: row.id }]);
        setTotalRows(1);
    };
    const onDeleteClick = () => {
        setConfirmDelete(true);
    };
    // console.log("fpoprmdata",formData)

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
        setDeletButton(false);
        setHandleSubmitButton(true)

    };
    const handleDelete = async () => {
        setConfirmDelete(false);
        try {
            const modifiedby = sessionStorage.getItem("userId");
            await deleteCompatability(selectedRows,modifiedby);
            setSuccessMessage("Data successfullly deleted");
            setShowSuccessPopup(true);
            setSelectedRows([]);
            setHandleSubmitButton(true);
            setDeletButton(false);
            fetchData(page, perPage);
        } catch (error) {
            setErrorMessage(`Delete error: ${error?.message || error}`);
            setShowErrorPopup(true);
        }

    }

    const exportToExcel = (search = "") => {
            setDownloadDone(false);
            setDownloadProgress(null);
            
    setLoading(true);
            const apiCall =downloadComMaster;
    
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
                    link.setAttribute("download", "CompatabilityMaster.xlsx");
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
                    <p>Compatability Master</p>
                </div>
                <div className='ComCssUpload'>
                    <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" style={{ display: 'none' }} onChange={handleUpload} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>

                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <div className='BomMasterTexfiled'>
                    <ThemeProvider theme={TextFiledTheme}>
                        {/* Parent Part */}
                        <Autocomplete
                            ListboxComponent={DropdownCom}
                            options={storeRc.filter(item => item.partcode !== formData.partcode)} // exclude selected compatability
                            getOptionLabel={(option) => option.partcode}
                            isOptionEqualToValue={(option, value) => option.partcode === value.partcode}
                            value={storeRc.find(item => item.partcode === formData.parentpartcode) || null}
                            onChange={(event, newValue) => {
                                setFormData({
                                    ...formData,
                                    parentpartcode: newValue ? newValue.partcode : "",
                                    parentpartdescription: newValue ? newValue.partdescription : "",
                                });
                            }}
                            renderInput={(params) => <TextField {...params}
                                error={Boolean(formErrors?.parentpartcode)}
                                helperText={formErrors?.parentpartcode || ""}
                                label="Parent Partcode" size="small" />}
                        />


                        <Autocomplete
                            ListboxComponent={DropdownCom}
                            PopperComponent={CustomPopper}
                            options={storeRc}
                            getOptionLabel={(option) => option.partdescription}
                            isOptionEqualToValue={(option, value) => option.partdescription === value.parentpartdescription}
                            value={storeRc.find(item => item.partdescription === formData.parentpartdescription) || null}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData({
                                        ...formData,
                                        parentpartcode: newValue.partcode,
                                        parentpartdescription: newValue.partdescription,
                                    });
                                } else {
                                    setFormData({ ...formData, parentpartcode: "", parentpartdescription: "" });
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Parent Partdescription" size="small" />}
                        />

                        {/* Compatability Part */}
                        {/* Compatability Partcode */}
                        <Autocomplete
                            ListboxComponent={DropdownCom}
                            options={storeRc.filter(item => item.partcode !== formData.parentpartcode)} // ✅ exclude parent
                            getOptionLabel={(option) => option.partcode}
                            isOptionEqualToValue={(option, value) => option.partcode === value.partcode}
                            value={storeRc.find(item => item.partcode === formData.partcode) || null}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData({
                                        ...formData,
                                        partcode: newValue.partcode,
                                        partdescription: newValue.partdescription,
                                    });
                                } else {
                                    setFormData({ ...formData, partcode: "", partdescription: "" });
                                }
                            }}
                            renderInput={(params) => <TextField {...params}
                                error={Boolean(formErrors?.partcode)}
                                helperText={formErrors?.partcode || ""}
                                label="Compatability Partcode" size="small" />}
                        />

                        {/* Compatability Partdescription */}
                        <Autocomplete
                            ListboxComponent={DropdownCom}
                            PopperComponent={CustomPopper}
                            options={storeRc.filter(item => item.partcode !== formData.parentpartcode)} // ✅ same filter
                            getOptionLabel={(option) => option.partdescription}
                            isOptionEqualToValue={(option, value) => option.partdescription === value.partdescription}
                            value={storeRc.find(item => item.partdescription === formData.partdescription) || null}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setFormData({
                                        ...formData,
                                        partcode: newValue.partcode,
                                        partdescription: newValue.partdescription,
                                    });
                                } else {
                                    setFormData({ ...formData, partcode: "", partdescription: "" });
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Compatability Partdescription" size="small" />}
                        />

                    </ThemeProvider>

                </div>

                <div className='ComCssButton9'>
                    {addButton &&
                        <button className='ComCssAddButton' onClick={handleAddClick}  >ADD</button>
                    }
                    <button className='ComCssClearButton' onClick={formClear}>Clear</button>

                    {updateButton &&
                        <button className='ComCssClearButton' onClick={handleUpdate}>Update</button>

                    }
                    {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}

                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Compatability</h5>

                    <CompatabilityAddTable
                    resetKey={resetKey}
                        data={tableData}
                        page={page}
                        perPage={perPage}
                        totalRows={compatabilityData.length}
                        loading={false}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setIsFrozen={setIsFrozen}
                        setTableData={setTableData}
                    />
                    <div className="ComCssButton9">
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                        <button className='ComCssDeleteButton' onClick={cancelTableData} >Cancel</button>

                    </div>
                </div>
            )}
            {showUploadTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Compatability</h5>

                    <CompatabilityUploadTable
                        data={excelUploadData}
                        page={page}
                        perPage={perPage}
                        totalRows={excelUploadData.length}
                        loading={false}
                        setPage={setPage}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setIsFrozen={setIsFrozen}
                        setExcelUploadData={setExcelUploadData}
                        setShowUploadTable={setShowUploadTable}
                    />
                    <div className="ComCssButton9">
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                        <button className='ComCssDeleteButton' onClick={cancelTableData} >Cancel</button>

                    </div>
                </div>
            )}
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Compatability Details</h5>
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

                <CompatabilityDefaultTable
                    data={compatabilityData}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    onEdit={handleEditClick}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    setDeletButton={setDeletButton}
                    setAddButton={setAddButton}
                    setUpdateButton={setUpdateButton}

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
        </div>)
}
export default CompatabilityMaster