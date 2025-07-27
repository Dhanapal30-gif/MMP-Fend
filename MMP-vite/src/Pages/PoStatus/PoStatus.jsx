import React, { useState, useEffect } from 'react';
import PoTextFiled from "../../components/PoStatus/PoTextFiled";
import { fetchPoStatusData } from '../../components/PoStatus/PoAction.js';
import "../../components/Com_Component/COM_Css.css";
import PoTableReSummary from "../../components/PoStatus/PoTableReSummary";
import PoTable from "../../components/PoStatus/PoTable";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { savePoStataus } from '../../Services/Services_09.js';


const PoStatus = () => {
    const [formData, setFormData] = useState({
        year: "",
        status: "",
        ponumber: "",
        partcode: "",
        partdescription: ""
    });

    const [formPoStatus, setFormPoStataus] = useState({
        Poid: "", ponumber: "", postatus: "",
    })

    const [poData, setPoData] = useState([]);
    const [triggerFetch, setTriggerFetch] = useState(false); 

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchRecText, setSearchRecText] = useState("");
    const [poStatusData, setPoStatusData] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formPo, setformPo] = useState("");
    const handleChange = (name, value) => {
        const newData = {
            ...formData,
            [name]: value
        };
        setFormData(newData);
    };

    const handlePoChange = (id, field, value) => {
        setPoData((prev) =>
            prev.map((item) =>
                item.Poid === id
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };


    const [poDropdownOptions, setPoDropdownOptions] = useState({
        ponumberOptions: [],
        partcodeOptions: [],
        partDescriptionOptions: [],
    });

   useEffect(() => {
  if (searchText) return;

  const loadPoStatusData = () => {
    const { year, status, ponumber, partcode } = formData;

    if (year || status || ponumber || partcode) {
      setLoading(true);
      fetchPoStatusData((data) => {
        const responseData = data?.content || [];

        setPoData(
          responseData.map((item, index) => ({
            ...item,
            id: `${item.Poid}_${index}`,
          }))
        );

        setTotalRows(data?.totalElements || 0);
        setPerPage(data?.size || 10);

        const ponumberOptions = [...new Set(responseData.map((item) => item.ponumber))]
          .filter(Boolean)
          .map((val) => ({ label: val, value: val }));

        const partcodeOptions = [...new Set(responseData.map((item) => item.partcode))]
          .filter(Boolean)
          .map((val) => ({ label: val, value: val }));

        const partDescriptionOptions = [...new Set(responseData.map((item) => item.partdescription))]
          .filter(Boolean)
          .map((val) => ({ label: val, value: val }));

        setPoDropdownOptions({
          ponumberOptions,
          partcodeOptions,
          partDescriptionOptions
        });

        setLoading(false);
      }, year, status, ponumber, partcode, page - 1, perPage);
    }
  };

  loadPoStatusData(); // ✅ Call here
}, [formData, page, perPage]);


    const filteredData = poData.filter((item) =>
        Object.values(item).some(
            (val) => val && val.toString().toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const filteredRecData = poData.filter((item) =>
        Object.values(item).some(
            (val) => val && val.toString().toLowerCase().includes(searchRecText.toLowerCase())
        )
    );


    useEffect(() => {
        if (searchText) {
            setPage(1); 
        }
    }, [searchText]);

    useEffect(() => {
        setPage(1);           
        setTriggerFetch(p => !p); 
    }, [formData, searchText]);


    useEffect(() => {
        console.log("PO Dropdown Options:", poData);
    }, [poData]);
    console.log("selectedRows", selectedRows);

   const handleSubmit = async () => {
  if (selectedRows.length === 0) {
    setErrorMessage("Select at least one row");
    setShowErrorPopup(true);
    return;
  }

  const selectedPoStatusData = poData
    .filter(row => selectedRows.includes(row.id))
    .map(row => ({
      ...row,
      id: row.id?.split("_")[0]  // keep only numeric ID
    }));

  try {
    for (const row of selectedPoStatusData) {
      await savePoStataus(row.id, row);  // ✅ Send with ID in URL
    }
    setSuccessMessage("Data submitted successfully!");
    setShowSuccessPopup(true);
    setSelectedRows([]); 
    loadPoStatusData(); // 🔁 Reload updated data

  } catch (error) {
    console.error("Submit error", error);
    setErrorMessage("Failed to submit data.");
    setShowErrorPopup(true);
  }
};


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>PoStatus</h5>
                </div>

                <PoTextFiled
                    formData={formData}
                    handleChange={handleChange}
                    poDropdownOptions={poDropdownOptions}

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
                <PoTable
                    data={searchText ? filteredData : poData}  // ✅ filter only if search
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    handlePoChange={handlePoChange}
                />
                <div className="ComCssButton9">
                    {poData.length > 0 && (
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>
                            Submit
                        </button>
                    )}
                </div>
            </div>

            <div className='ComCssTable'>

                <h5 className='ComCssTableName'>Receiving Summary</h5>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchRecText)} >
                        <FaFileExcel /> Export
                    </button>
                    <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                        <input type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }} placeholder="Search..." value={searchRecText}
                            onChange={(e) => setSearchRecText(e.target.value)}
                        />
                        {searchRecText && (
                            <span
                                onClick={() => setSearchRecText("")}
                                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold" }} >
                                ✖
                            </span>
                        )}
                    </div>
                </div>
                <PoTableReSummary
                    data={filteredRecData}
                    page={page}
                    perPage={perPage}
                    totalRows={searchRecText ? filteredRecData.length : totalRows}
                    loading={loading}
                    setPage={setPage}
                    setPerPage={setPerPage}
                // selectedRows={selectedRows}
                // setSelectedRows={poData}
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
    );
};

export default PoStatus;
