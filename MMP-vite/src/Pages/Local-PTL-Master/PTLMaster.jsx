import React, { useState, useRef, useMemo, useEffect } from 'react';
import PTLTextfiled from "../../components/Local-PTL-Master/PTLTextfiled";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocalMaster, downloadSearchLocalMaster, getLocalkMasterSearch, getLocalMaster, saveLocalMasteUpload, savePTLStore } from '../../Services/Services_09';
import * as XLSX from "xlsx";
import PTLTable from "../../components/Local-PTL-Master/PTLTable";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { deleteLocalMaster } from '../../Services/Services-Rc';
import DataTable from "react-data-table-component";
const PTLMaster = () => {

    const [formData, setFormData] = useState({
        partcode: "", partdescription: "", rohsstatus: "", msdstatus: "",
        technology: "", racklocation: "", unitprice: "", customduty: "",
        quantity: "", catmovement: "", MOQ: "", TRQty: "",

    });

    const [localStore, setLocalStore] = useState({});

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [putawayDetail, setPutawayDetail] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [deletButton, setDeletButton] = useState();
    const [UploadTable, setUploadTable] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [excelUploadData, setExcelUploadData] = useState([]);
    const [showTable, setShowTable] = useState(true);
    const fileInputRef = useRef(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const duplicateProducts = [];
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    // console.log("formData", formData);


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = "Please Enter Partcode";
            isValid = false;
        }
        if (!formData.quantity) {
            errors.quantity = "Please Enter quantity";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;
        setLoading(true);

        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedby = sessionStorage.getItem("userName") || "System";

        const submitData = {
            ...formData,
            createdby,
            updatedby,
            quantity: formData.quantity || null,
            TRQty: formData.TRQty || null,
        };

        savePTLStore(submitData)
            .then((response) => {
                handleSuccessCommon({
                    response,
                    setSuccessMessage,
                    setShowSuccessPopup,
                    afterSuccess: () => {
                        handleClear();
                        setSelectedRows([]);
                        fetchPTLDetail();
                    },
                });
            })
            .catch((error) => {
                handleErrorCommon({
                    error,
                    setErrorMessage,
                    setShowErrorPopup,
                });
            }).finally(() => {
                setLoading(false);
            })
    };
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);
        return debouncedValue;
    };
    const debouncedSearch = useDebounce(searchText, 500); // delay in ms

    useEffect(() => {
        fetchData(page, perPage, debouncedSearch);
    }, [page, perPage, debouncedSearch])

    const fetchData = (page = 1, size = 10, search = "") => {
        // console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(page, size, search);

        } else {
            fetchPTLDetail(page, perPage);
        }
    }

    const fetchPTLDetail = (page = 1, size = 10) => {
        setLoading(true);
        getLocalMaster(page - 1, size)
            .then((response) => {
                setLocalStore(response.data.content || []);
                setTotalRows(response.data.totalElements || 0);
                // console.log('fetchPodetail', response.data);
            }).catch((error) => {
                console.error("Error fetching PTL details:", error);
            })
            .finally(() => setLoading(false)); // ✅ stop loading after completion
    };

    const fetchfindSearch = (page = 1, size = 10, search = "") => {
        setLoading(true);
        getLocalkMasterSearch(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setLocalStore(response.data.content);
                    setTotalRows(response.data.totalElements || 0);
                } else {
                    console.warn("No content found in response:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching search data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };
    const handleEdit = (row) => {
        setFormData({ ...row });
        setIsEditMode(true);
    };
    const exportToExcel = (search = "") => {
        setDownloadDone(false);
        setDownloadProgress(null);
        setLoading(true);

        const apiCall = search?.trim() !== "" ? downloadSearchLocalMaster : downloadLocalMaster;

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
                link.setAttribute("download", "PTLMaster.xlsx");
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
    const handleClear = () => {
        setFormData({
            partcode: "", partdescription: "", rohsstatus: "", msdstatus: "",
            technology: "", racklocation: "", unitprice: "", customduty: "",
            quantity: "", catmovement: "", MOQ: "", TRQty: "",
        });
        setIsEditMode(false);
        setDeletButton(false);
        setSelectedRows([]);
        setFormErrors({});
    }

    // useEffect(() => {
    //     console.log("selectedrows", selectedRows)
    // }, [selectedRows])


    const onDeleteClick = () => {
        setConfirmDelete(true);
        setIsEditMode(false);
    };
    // console.log("fpoprmdata",formData)

    const handleCancel = () => {
        setSelectedRows([]);
        setConfirmDelete(false);
        setDeletButton(false);
        // setHandleSubmitButton(true)

    };

    const handleDelete = async () => {
        setConfirmDelete(false);

        try {
            const modifiedby = sessionStorage.getItem("userId") || "System";
            await deleteLocalMaster(selectedRows, modifiedby);
            setSuccessMessage("Data successfullly deleted");
            setShowSuccessPopup(true);
            setSelectedRows([]);
            // setHandleSubmitButton(true);
            setDeletButton(false);
            fetchData(page, perPage);
        } catch (error) {
            setErrorMessage(`Delete error: ${error?.message || error}`);
            setShowErrorPopup(true);
        }

    }


    const handleDownloadExcel = () => {
        const worksheetData = [
            ["partcode", "partdescription", "rohsstatus", "msdstatus", "technology", "racklocation", "quantity",
                "unitprice", "customduty", "catmovement", "MOQ", "TRQty"]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");

        XLSX.writeFile(workbook, "LocalPTLMaster.xlsx");
    };

    // const handlePerRowsChange = useCallback((newPerPage, page) => {
    //   setPerPage(newPerPage);
    //   setPage(page);
    //   fetchMainMaster(page, newPerPage); // call API for new perPage
    // }, []);
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
                name: "Msd Status", selector: row => row.msdstatus, width: `${calculateColumnWidth(excelUploadData, 'msdstatus')}px`
            },
            {
                name: "Technology", selector: row => row.technology, width: `${calculateColumnWidth(excelUploadData, 'technology')}px`
            },
            {
                name: "Rack Location",
                selector: row => row.racklocation
                    ? row.racklocation.split(",").map(email => <div key={email}>{email}</div>)
                    : "", width: `${calculateColumnWidth(excelUploadData, 'racklocation')}px`

            },

            {
                name: "Quantity", selector: row => row.quantity, width: `${calculateColumnWidth(excelUploadData, 'quantity')}px`
            },
            {
                name: "UnitPrice", selector: row => row.unitprice, width: `${calculateColumnWidth(excelUploadData, 'unitprice')}px`
            },

            {
                name: "Custom Duty", selector: row => row.customduty, width: `${calculateColumnWidth(excelUploadData, 'customduty')}px`
            },
            //   {
            //     name: (<div>Active For <br /> Componant</div>), selector: row => row.AFO, width: `${calculateColumnWidth(excelUploadData, 'AFO')}px`
            //   },
            {
                name: "Catmovement", selector: row => row.catmovement, width: `${calculateColumnWidth(excelUploadData, 'catmovement')}px`
            },
            //   {
            //     name: (<div>Type Of <br /> Component</div>), selector: row => row.TYC, width: `${calculateColumnWidth(excelUploadData, 'TYC')}px`
            //   },
            {
                name: "MOQ", selector: row => row.MOQ, width: `${calculateColumnWidth(excelUploadData, 'MOQ')}px`
            },
            {
                name: "Threshold Request Qty ", selector: row => row.TRQty, width: `${calculateColumnWidth(excelUploadData, 'TRQty')}px`
            }
        ]
    }, [excelUploadData]);

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

    const handleUpload = (event) => {
        setExcelUploadData([]);
         setShowTable(false);
         setUploadTable(true);

        // setShowRcTable(false);
        // setHandleUpdateButton(false);
        setFormData({
          partcode: '', partdescription: '', rohsstatus: '',msdstatus:'',technology:'', racklocation: '', quantity: '', unitprice: '', customduty: '', createdby: '',
          catmovement: '', MOQ: '', TRQty: ''
        }); setSelectedRows([]);
        // setDeletButton(false);
    
        const file = event.target.files[0];
        if (!file) return;
    
        if (!file.name.startsWith("LocalPTLMaster")) {
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
        //   setHandleUploadButton(true);
        //   setHandleSubmitButton(false);
         
        //   setUploadTable(false)
          // setShowProductTable(false);
        };
    }


    
//       const excelUpload = (e) => {
//   e.preventDefault();

//   const createdby = sessionStorage.getItem("userName") || "System";
//   const modifiedby = sessionStorage.getItem("userName") || "System";

//   const updatedFormData = excelUploadData.map(item => ({
//     ...item,
//     createdby,
//     modifiedby,
//   }));

//   setLoading(true);

//   saveLocalMasteUpload(updatedFormData)
//     .then(() => {
//       setSuccessMessage("Master Data Added Successfully.");
//       setShowSuccessPopup(true);
//       setShowTable(true);
//       setUploadTable(false);
//       setExcelUploadData([]);
//        fetchData(page, perPage);
//     //   fetchMainMaster(page, perPage);
//     //   setSearchText("");
    
    
//     })
//     .catch((error) => {

//       if (error.response) {
//         setErrorMessage(error.response.data?.message || "Server error");
//         setShowErrorPopup(true);
//       } else {
//         setErrorMessage("Network error, please try again");
//         setShowErrorPopup(true);
//       }

//     })
//     .finally(() => {
//       setLoading(false);
//     });
// };

const excelUpload = (e) => {
  e.preventDefault();

  // ✅ max 50 rows check
  if (excelUploadData.length > 50) {
    alert("Maximum 50 rows only allowed");
    return;
  }

  // ✅ quantity empty check
  const hasEmptyQty = excelUploadData.some(
    row => !row.quantity || row.quantity === "" || row.quantity === null
  );

  if (hasEmptyQty) {
    alert("Quantity field cannot be empty");
    return;
  }

  const createdby = sessionStorage.getItem("userName") || "System";
  const modifiedby = sessionStorage.getItem("userName") || "System";

  const updatedFormData = excelUploadData.map(item => ({
    ...item,
    createdby,
    modifiedby,
  }));

  setLoading(true);

  saveLocalMasteUpload(updatedFormData)
    .then(() => {
      setSuccessMessage("Master Data Added Successfully.");
      setShowSuccessPopup(true);
      setShowTable(true);
      setUploadTable(false);
      setExcelUploadData([]);
      fetchData(page, perPage);
    })
    .catch((error) => {
      if (error.response) {
        setErrorMessage(error.response.data?.message || "Server error");
      } else {
        setErrorMessage("Network error, please try again");
      }
      setShowErrorPopup(true);
    })
    .finally(() => {
      setLoading(false);
    });
};


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>PTL Master</p>
                </div>
                <div className='ComCssUpload'>
                    <input type="file" key={fileInputKey} accept=".xlsx, .xls" id="fileInput" onChange={handleUpload} style={{ display: 'none' }} />
                    < button onClick={() => document.getElementById("fileInput").click()} >  Excel Upload </button>
                    <button onClick={handleDownloadExcel}> Excel Download </button>
                </div>
                <PTLTextfiled
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors} // ✅ Pass this prop

                />
                <div className="ComCssButton9">

                    {!isEditMode && (
                        <button className='ComCssSubmitButton' onClick={handleSubmit} >
                            Submit
                        </button>)}
                    {isEditMode && (

                        <button className='ComCssUpdateButton' onClick={handleSubmit} >
                            Update
                        </button>
                    )}

                    <button className='ComCssClearButton' onClick={handleClear} > Clear </button>
                    {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}

                </div>
            </div>



            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>PTL Master Detail</h5>
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

                    <PTLTable
                        data={localStore}
                        page={page}
                        perPage={perPage}
                        totalRows={totalRows}
                        loading={loading}
                        setPage={setPage}
                        setPerPage={setPerPage}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        onEdit={handleEdit} // 👈 This is the important line
                        setDeletButton={setDeletButton}
                    />

                </div>
            )}
{UploadTable && (
            <div className='ComCssTable'>
 <h5 className='ComCssTableName'>PTL Master Detail</h5>
                
                    
                    <DataTable
                        columns={uploadColumn}
                        data={excelUploadData}
                        pagination
                        // paginationServer
                        progressPending={loading}
                        paginationTotalRows={excelUploadData.length}
                        // onChangeRowsPerPage={excelUploadData.length}
                        // onChangePage={handlePageChange}
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

                <div className="ComCssButton9">
                        <button className='ComCssUpdateButton' onClick={excelUpload} >
                            Upload
                        </button>
                </div>
            </div>
            )}
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

export default PTLMaster