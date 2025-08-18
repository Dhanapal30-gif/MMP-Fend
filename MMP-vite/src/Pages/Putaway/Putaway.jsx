import React, { useState, useEffect } from 'react';
import PutawayTextFiled from "../../components/Putaway/PutawayTextFiled";
import './Putaway.css';
import { fetchPutawayTicket, fetchPutawayDetail } from '../../components/Putaway/PutawayActions.js';
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";

const Putaway = () => {

    const [formData, setFormData] = useState({
        year: "",
        status: "",
        ponumber: "",
        partcode: "",
        partdescription: ""
    });
    const [putawayTicket, setPutawayTicket] = useState({});

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [putawayDetail, setPutawayDetail] = useState([]);

    const handleChange = (name, value) => {
        const newData = {
            ...formData,
            [name]: value
        };
        setFormData(newData);
    };

    useEffect(() => {
        fetchPutawayTicket(setPutawayTicket);
    }, [])



    useEffect(() => {
  fetchPutawayDetail(page, perPage, setPutawayDetail);
}, []);

// console.log("setPutawayDetail", putawayDetail);

    // useEffect(() => {
    //     console.log("putawayTicketguyguy", putawayTicket);
    // }, [putawayTicket]); // <-- log after value updates
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>Putaway</h5>
                </div>
<h5>Pagination issue every pagination send page 0 </h5>
                <PutawayTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    poDropdownOptions={Array.isArray(putawayTicket) ? [...new Set(putawayTicket)] : []}

                />
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
            </div>

        </div>
    )
}

export default Putaway