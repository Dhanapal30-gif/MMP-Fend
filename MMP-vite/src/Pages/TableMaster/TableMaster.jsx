import React, { useState, useEffect, useRef } from 'react';
import TableMasterTextFiled from "../../components/TableMaster/TableMasterTextFiled";
import RequesterAddTable from "../../components/Requester/RequesterAddTable";
import RequesterDefaultTable from "../../components/Requester/RequesterDefaultTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchRequesterDetail, fetchRequesterSearch } from "../../components/Requester/RequesterActions.js";
import { FaFileExcel, FaBars } from "react-icons/fa";
import { saveGRN, saveTable } from '../../Services/Services_09.js';
import { checkAvailable, downloadRequester, fetchAvailableAndCompatabilityQty, fetchProductAndPartcode, fetchRequesterType, fetchTable, fetchTableProductDetail, saveRequester } from '../../Services/Services-Rc.js';
import { ContactSupportOutlined } from '@mui/icons-material';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import DataTable from "react-data-table-component";

const TableMaster = () => {

    const [requestType, setRequestType] = useState([])
    const [requesterType, setRequesterType] = useState([])
    const [productandPartcode, setProductandPartcode] = useState([])
    const [tableMasterData, setTableMasterData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [downloadDone, setDownloadDone] = useState(false);
    const [requesterDeatil, setRequesterDetail] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [addSearchText, setAddSearchText] = useState("");
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [formData, setFormData] = useState({
        tableName: '',
        productname: '',

    });


    useEffect(() => {
        fetchPtoductDetail();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchPtoductDetail = async () => {
        try {
            const response = await fetchTableProductDetail();
            setProductandPartcode(response.data.table1);
        } catch (error) {
            console.error("Error fetching compatibility data:", error);
        } finally {
            setLoading(false); // stop loading
        }

    }


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.tableName) {
            errors.tableName = "Please Select tableName";
            isValid = false;
        }

        // if (!formData.productname) {
        //     errors.productname = "Please Select Product Name";
        //     isValid = false;
        // }



        setFormErrors(errors);
        return isValid;
    };
    useEffect(() => {
        fetchTableMasterDetail();
    }, []);


    const fetchTableMasterDetail = () => {
        fetchTable()
            .then((response) => {
                const tableData = (response.data.tableData || []).map(item => ({
                    ...item,
                    createdAt: item.createdAt instanceof Array ? new Date(...item.createdAt).toLocaleString() : item.createdAt,
                    updatedon: item.updatedon instanceof Array ? new Date(...item.updatedon).toLocaleString() : item.updatedon
                }));
                setTotalRows(tableData.length);
                setTableMasterData(tableData);
            })
            .catch((error) => {
                console.error("Error fetching table master data:", error);
            });
    };

    console.log("tableMasterData", tableMasterData)

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!valiDate()) return;
        setLoading(true);

        const userName = localStorage.getItem("userId") || "System";

        // Combine all selected product names into a single comma-separated string
        const tableDescription = (formData.productName || [])
            .map(p => p.productname)
            .join(',');

        // Single payload object
        const payload = {
            tableName: formData.tableName,
            tableDescription: tableDescription,
            createdby: userName,
            updatedby: userName
        };

        saveTable([payload]) // send as a single-item array
            .then((response) => {
                if (response.status === 200 && response.data) {
                    setSuccessMessage("Saved successfully");
                    setShowSuccessPopup(true);
                    setFormData({ tableName: '', productName: [] }); // reset form
                } else {
                    setErrorMessage(response.data || "Unknown error");
                    setShowErrorPopup(true);
                }
            })
            .catch((error) => {
                const msg = error?.response?.data || error?.message || "Network error, please try again";
                setErrorMessage(msg);

                setShowErrorPopup(true);
            })
            .finally(() => setLoading(false));
    };



    const calculateColumnWidth = (data, key, minWidth = 290, maxWidth = 318) => {
        if (!data || data.length === 0) return minWidth;
        const maxLength = Math.max(...data.map(row => (row[key] ? row[key].toString().length : 0)));
        const width = maxLength * 8; // Adjust the multiplier as needed for better fit
        return Math.min(Math.max(width, minWidth), maxWidth);
    };


    const handlePageChange = (newPage) => {
        setPage(newPage)
    }

    const handlePerRowsChange = (newPerPage, newPage) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }

    const filteredData = tableMasterData.filter(row =>
        Object.values(row).some(value =>
            typeof value === "string" && value.toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const paginatedData = filteredData.slice(
        page * perPage,
        (page + 1) * perPage
    );
    const columns = [
        // {
        //     name: (
        //         <div style={{ textAlign: 'center', marginLeft: '10px' }}>
        //             <label>Select</label>
        //             <br />
        //             <input type="checkbox" onChange={handleSelectAll}
        //                 checked={selectedRows.length === vendorMaster.length && vendorMaster.length > 0}
        //             />
        //         </div>
        //     ),
        //     cell: (row) => (
        //         <div style={{ paddingLeft: '23px', width: '100%' }}>
        //             <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)}
        //             />
        //         </div>
        //     ),
        //     width: "97px",
        //     center: true,
        // }
        // ,
        // { name: "Edit", selector: row => (<button className="edit-button" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },

        {
            name: "Table Name", selector: row => row.tableName, sortable: true, width: `${calculateColumnWidth(tableMasterData, 'tableName')}px`
        },
        {
            name: "ProductName", selector: row => row.tableDescription, width: `${calculateColumnWidth(tableMasterData, 'tableDescription')}px`
        },
        {
            name: "createdAt", selector: row => row.createdAt, width: `${calculateColumnWidth(tableMasterData, 'createdAt')}px`
        },
        {
            name: "createdby", selector: row => row.createdby, width: `${calculateColumnWidth(tableMasterData, 'createdby')}px`
        }
    ];

    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Table Master</p>
                </div>
                <TableMasterTextFiled
                    formData={formData}
                    productandPartcode={productandPartcode}
                    handleChange={handleChange}
                    formErrors={formErrors}
                />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton' onClick={handleSubmit} >Submit</button>
                    <button className='ComCssClearButton' >Clear</button>
                </div>
            </div>

            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>TableMaster Detail</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)}  >
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
                    columns={columns}
                    data={paginatedData}
                    pagination
                    paginationServer
                    progressPending={loading}
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    paginationPerPage={perPage}
                    paginationDefaultPage={page}
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
        </div>
    )
}

export default TableMaster