import React, { useState, useEffect } from 'react';
import PTLTextfiled from "../../components/Local-PTL-Master/PTLTextfiled";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { getLocalMaster, savePTLStore } from '../../Services/Services_09';

import PTLTable from "../../components/Local-PTL-Master/PTLTable";

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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    console.log("formData", formData);


    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = "Please Enter Partcode";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valiDate()) return;

        const createdby = sessionStorage.getItem("userName") || "System";
        const updatedby = sessionStorage.getItem("userName") || "System";

        const submitData = {
            ...formData,
            createdby,
            updatedby
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
            });
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
        console.log("searchfetch", search);
        if (search && search.trim() !== "") {
            //   fetchfind(page, size, search);

        } else {
            fetchPTLDetail(page, perPage);
        }
    }

    const fetchPTLDetail = (page = 1, size = 10) => {
        getLocalMaster(page - 1, size)
            .then((response) => {
                setLocalStore(response.data.content || []);
                setTotalRows(response.data.totalElements || 0);
                // console.log('fetchPodetail', response.data);
            })
    }

    const handleEdit = (row) => {
        setFormData({ ...row });
        setIsEditMode(true);
    };

    const handleClear = () => {
        setFormData({
            partcode: "", partdescription: "", rohsstatus: "", msdstatus: "",
            technology: "", racklocation: "", unitprice: "", customduty: "",
            quantity: "", catmovement: "", MOQ: "", TRQty: "",
        });
        setIsEditMode(false);
        setFormErrors({});
    }
    console.log("setLocalStore", localStore);
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>PTLStore</h5>
                </div>

                <PTLTextfiled
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors} // ✅ Pass this prop

                />
                <div className="ComCssButton9">

                    {!isEditMode && (
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit} >
                            Submit
                        </button>)}
                    {isEditMode && (

                        <button style={{ backgroundColor: 'orange' }} onClick={handleSubmit} >
                            Update
                        </button>
                    )}
                    <button onClick={handleClear} > Clear </button>

                </div>
            </div>
            <div className='ComCssTable'>

                <h5 className='ComCssTableName'>Po Summary</h5>
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

                />
            </div>

        </div>

    )
}

export default PTLMaster