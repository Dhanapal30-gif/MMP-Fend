import React, { useState, useEffect } from 'react';
// import putawayTextFile from "../../components/LocalPutaway/putawayTextFile";
import LocalPutawayDetailTable from "../../components/LocalPutaway/LocalPutawayDetailTable";
import LocalPutawayTicketTable from "../../components/LocalPutaway/LocalPutawayTicketTable";
import PutawayTextFiled from "../../components/LocalPutaway/PutawayTextFiled";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { downloadLocal, downloadSearchLocal, fetchBoardSerialNumber, fetchproductPtl, fetchPTLPutaway, fetchPTLPutawayTicket, fetchPTLPutawayTicketDetail, fetchPutaway, getindiviualDetailFilter, getindiviualDetailFind, getLocalINdiviual, getLocalMaster, getLocalPutaway, getLocalPutawaySearch, savePTLRepaier, savePTLRequest, savePTLStore, savePutaway, savePutLocation, saveTicketPutaway } from '../../Services/Services_09';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { deleteLocalPutaway } from '../../Services/Services-Rc';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const LocalPutaway = () => {
    const [formData, setFormData] = useState({
        partcode: "",
        partdescription: "",
        racklocation: "",
        availableQuantity: "",
        quantity: "",
        createdby: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ptldata, setPTLData] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requestButton, setRequestButton] = useState(true);
    const [isFrozen, setIsFrozen] = useState(false);
    const [submitButton, setSubmitButton] = useState(false);
    const [putButton, setPutButton] = useState(false);
    const [clearButton, setClearButton] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [indiviualReport, setIndiviualReport] = useState([])
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [responseOk, setResponseOk] = useState(false)
    const [putawayTableData, setPutawayTableData] = useState([])
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedRows,setSelectedRows]=useState([])
        const [deletButton, setDeletButton] = useState();
        const [confirmDelete, setConfirmDelete] = useState(false);
        const [isTicetFreze, setIsTicetFreze]=useState(false);
        const [ptlPutawayTicketList, setPTLPutawayTicketList]=useState([])
        const [pTLPutawayTicketDetails, setPTLPutawayTicketDetails]=useState([])
    
    // console.log("ptldata", ptldata);
    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value   // ✅ avoid setting download: ""
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = {
            ...formData,
            [name]: value,
        };


        setFormData(updatedForm);
    };

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = "Please select partcode";
            isValid = false;
        }

        if (!formData.quantity) {
            errors.quantity = "Please select quantity";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
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
        fetchData();
        fetchPutawayTicket();

    }, []);

    useEffect(() => {
        fetchPutawayDetailTable(page, perPage, debouncedSearch);

    }, [page, perPage, debouncedSearch]);

    useEffect(() => {
  if (formData.ticket) {
    fetchPutawayTicketDetail(formData.ticket);
  }
}, [formData.ticket]);


 const fetchPutawayTicketDetail = (ticket) => {
        setLoading(true);
        fetchPTLPutawayTicketDetail(ticket)
            .then((response) => {
                setPTLPutawayTicketDetails(response.data || []);
                // setSubmitButton(true);
                setPutButton(true);
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };
    
    console.log("pTLPutawayTicketDetails", pTLPutawayTicketDetails)

    const fetchPutawayDetailTable = (page = 1, size = 10, search = "") => {
        // console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            fetchfindSearch(page, size, search);
        }
        else {
            fetchPutawayDetail(page, size);
        }

    };
    const fetchData = () => {
        setLoading(true);
        fetchPTLPutaway()
            .then((response) => {
                setPTLData(response.data);
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };

    const fetchPutawayTicket = () => {
        setLoading(true);
        fetchPTLPutawayTicket()
            .then((response) => {
                setPTLPutawayTicketList(response.data.tickets || []);
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };

    

    const fetchPutawayDetail = (page = 1, size = 10) => {
        setLoading(true);
        getLocalPutaway(page - 1, size)
            .then((response) => {
                setPutawayTableData(response.data.content);
                setTotalRows(response.data.totalElements)
            })
            .catch((error) => {
                // console.error("Error fetching receiving data:", error);
            }).finally(() => {
                setLoading(false);
            })
    };

    const fetchfindSearch = (page = 1, size = 10, search = "") => {
        setLoading(true);
        getLocalPutawaySearch(page - 1, size, search)
            .then((response) => {
                if (response?.data?.content) {
                    setPutawayTableData(response.data.content);
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
    // console.log("putawayTable", putawayTableData)

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const modifiedby = sessionStorage.getItem("userId") || "System";
        let updatedFormData;
        if(isEditMode){
      const { modifiedby, createddate, modifieddate, ...rest } = formData;

    updatedFormData = {
        ...rest,    // <- use rest, not formData
        id: formData.id,
    };
        }else{
         updatedFormData = {
            ...formData,
            modifiedby,
            createdby: modifiedby,
        };
    }
        savePutaway(updatedFormData)
            .then((response) => {
                // fetchMainMaster(page, perPage);
                setSuccessMessage(response.data.message || "Masterdata Added Successfully");
                setShowSuccessPopup(true);
                formClear();
                setSubmitButton(false);
                fetchData();
                fetchPutawayDetailTable();
                setsearchText("");
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
            }).finally(() => {
                setLoading(false);
            })
    }

    const handlePTLTicketSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        const createdby = sessionStorage.getItem("userId") || "System";
        let updatedFormData;
            
         const updatedData = (pTLPutawayTicketDetails.data || []).map(row => ({
        createdby,
        partcode: row.partcode,
        quantity: row.requestQty,    // use edited value
        racklocation: row.racklocation,
        partdescription: row.partdescription,
        // ptlreqticketno: row.ptlreqticketno
    }));
    const ticketNo = pTLPutawayTicketDetails.data[0]?.ptlreqticketno;
     

        saveTicketPutaway(updatedData,ticketNo)
            .then((response) => {
                // fetchMainMaster(page, perPage);
                setSuccessMessage(response.data.message || "Masterdata Added Successfully");
                setShowSuccessPopup(true);
                formClear();
                setSubmitButton(false);
                fetchData();
                fetchPutawayDetailTable();
                fetchPutawayTicket();
                setSearchText("");
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
            }).finally(() => {
                setLoading(false);
            })
    }

    const handlePut = (e) => {
        e.preventDefault();
        // if (!valiDate()) return;
        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            createdby,
        };
         const updatedData = (pTLPutawayTicketDetails.data || []).map(row => ({
        createdby,
        partcode: row.partcode,
        quantity: row.requestQty,    // use edited value
        racklocation: row.racklocation
    }));
            // const payload = isTicetFreze ? updatedData : updatedFormData;
      const payload = isTicetFreze ? updatedData : [{
        createdby,
        partcode: formData.partcode,
        quantity: formData.quantity,
        racklocation: formData.racklocation,
        availableQuantity: formData.availableQuantity,
        partdescription: formData.partdescription
    }];  
    savePutLocation(payload)
            .then((response) => {
                setSubmitButton(true);
                setPutButton(false)
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
    }
    // console.log("formdata", formData)

    useEffect(() => {
        if (formData.quantity) {
            // setPutButton(true);
        }
    }, [formData.quantity]);

    const formClear = () => {
        setSubmitButton(false);
        setIsEditMode(false);
        setIsTicetFreze(false);
        setPutButton(false);
        setPTLPutawayTicketDetails([])
        setFormData({
            partcode: "",
            partdescription: "",
            racklocation: "",
            availableQuantity: "",
            quantity: ""
        })
        setIsFrozen(false);
    }
    const exportToExcel = (search = "") => {
        setDownloadDone(false);
        setDownloadProgress(null);
        setLoading(true);

        const apiCall = search?.trim() !== "" ? downloadSearchLocal : downloadLocal;

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
                link.setAttribute("download", "LocalPutaway.xlsx");
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

   const handleEdit = (row) => {
    setIsEditMode(true);
    setIsFrozen(true);
    setFormData({
        ...row,
        quantity: row.putawayqty, // map column to formData field
    });
    setIsEditMode(true);
};


  const onDeleteClick = () => {
        setConfirmDelete(true);
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
                const modifiedby = sessionStorage.getItem("userId");
                await deleteLocalPutaway(selectedRows,modifiedby);
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
        const handleFrezeFiled=()=>{
            setIsTicetFreze(true)
            setPutButton(false)
            setSubmitButton(false)
        }

        const [data, setData]=useState([])

        const handleQtyChange = (rowIndex, value) => {
  const updatedData = [...pTLPutawayTicketDetails.data]; // or tableData state
  const approved = updatedData[rowIndex].approved1_qty || 0;
  const qty = Number(value);

  if (qty > approved) {
    setErrorMessage("Cannot enter more than Approved Qty")
    setShowErrorPopup(true);
    // alert("Cannot enter more than Approved Qty");
    return;
  }

  updatedData[rowIndex].requestQty = qty;
  setData(updatedData); // update state
};


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <div className="ComCssButton9">
                    <button className='ComCssExcelUploadButton' onClick={handleFrezeFiled}>Tickets</button>
                        </div>
                    <p>Putaway</p> 
                       
                </div>

                <PutawayTextFiled
                    ptldata={ptldata}
                    ptlPutawayTicketList={ptlPutawayTicketList}
                    formData={formData}
                    setFormData={setFormData}
                    handlePoChange={handlePoChange}
                    handleInputChange={handleInputChange}
                    isFrozen={isFrozen}
                    formErrors={formErrors}
                    isEditMode={isEditMode}
                    isTicetFreze={isTicetFreze}

                />
                <div className="ReworkerButton9">
                    <button className='ComCssClearButton' onClick={formClear} >Clear</button>

                    {submitButton &&
                        <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>
                    }
                    {isTicetFreze &&
                        <button className='ComCssSubmitButton' onClick={handlePTLTicketSubmit}>Submit</button>
                    }
                     {isEditMode && (

                        <button className='ComCssUpdateButton' onClick={handleSubmit} >
                            Update
                        </button>
                    )}
                    {formData.quantity &&
                        <button className='ComCssUpdateButton' onClick={handlePut}>Put</button>
                    }
                     {putButton &&
                        <button className='ComCssUpdateButton' onClick={handlePut}>Put</button>
                    }
                    {deletButton && <button className='ComCssDeleteButton' onClick={onDeleteClick}   >Delete</button>}


                </div>


            </div>
            {isTicetFreze &&
              <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Putaway TicketDetails</h5>
             <LocalPutawayTicketTable
                    data={pTLPutawayTicketDetails.data || []}
                    page={page}
                    perPage={perPage}
                    totalRows={pTLPutawayTicketDetails.length}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    setData={setData}
                    formErrors={formErrors}
                    handleQtyChange={handleQtyChange} 
                />
                </div>
}
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Putaway Detail</h5>
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
  <input
    type="text"
    className="form-control"
    style={{ height: "30px", paddingRight: "55px" }}
    placeholder="Search..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />

  {searchText && (
    <span
      onClick={() => setSearchText("")}
      style={{
        position: "absolute",
        right: "30px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        color: "#aaa",
        fontWeight: "bold"
      }}
    >
      ✖
    </span>
  )}

  <span
    // onClick={handleSearchClick}
    style={{
      position: "absolute",
      right: "8px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer"
    }}
  >
    🔍
  </span>
</div>


                </div>
                <LoadingOverlay loading={loading} />

                <LocalPutawayDetailTable
                    data={putawayTableData}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    onEdit={handleEdit} // 👈 This is the important line
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    setDeletButton={setDeletButton}
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

export default LocalPutaway