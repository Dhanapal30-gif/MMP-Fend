import React, { useState, useEffect, useRef } from 'react';
import PTLRequestTextFiled from "../../components/PTLOpreatorRequest/PTLRequestTextFiled";
import { getPTLPartcode, savePTLOpreatorRequest } from '../../Services/Services_09';
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import PTLRequestAddTable from "../../components/PTLOpreatorRequest/PTLRequestAddTable";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import DataTable from "react-data-table-component";

const PTLRequest = () => {
    const [rcMainStore, setRcMainStore] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
 const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
        const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isFrozen, setIsFrozen] = useState(false);
    const [suiData, setSuiData] = useState([]);


        const [formData, setFormData] = useState({
        partcode: "",
        requestQty: "",
    })

//     const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
// };
console.log("Form Data:", formData);

const handleChange = (e) => {
    const { name, value } = e.target;

    const numericValue = Number(value);
// const availableQty = Number(formData.availableQty || 0); // camelCase
const availableQty = Number(formData.availableQty || 0); // must match camelCase

    // console.log("availableQty", availableQty, "requestQty", numericValue);

    if (name === "requestQty" && numericValue > availableQty) {
        setErrorMessage(`Request Quantity cannot exceed available quantity (${availableQty})`);
        setShowErrorPopup(true);
        return; // prevent entering more than available
    }

    setFormData(prev => ({ ...prev, [name]: value }));
};



    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.partcode) {
            errors.partcode = "please select partcode";
            isValid = false;
        }
        // if (!formData.) {
        //   errors.potool = "please select potool";
        //   isValid = false;
        // }
        if (!formData.requestQty) {
            errors.requestQty = "please Enter requestQty";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    }
    useEffect(() => {
        fetchRcStoreMaster();

    }, []);

 useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);

    const fetchRcStoreMaster = async () => {
        try {
            const response = await getPTLPartcode();
            setRcMainStore(response.data);
        } catch (error) {
            console.error("Error fetching vendors", error);
        }
    };

const handleAddClick = () => {
        // if (!valiDate()) return;
        // alert("eriuh")
        if (tableData.some(item => item.partcode === formData.partcode)) {
            setErrorMessage("Partcode Already Added")
            setShowErrorPopup(true);
            return;
        }
        if (!valiDate()) return;

        setTableData(prev => [...prev, formData]);
        setIsFrozen(true);
        setFormData(prev => ({
            ...prev,
          
            partcode: "",
            partdescription: "",
            requestQty: "",
        }));
    };

    const handleSubmit = (e) => {
            e.preventDefault();
                setLoading(true);
    
            const userId = sessionStorage.getItem("userId") || "System";
            let updatedFormData;
    
    
                updatedFormData = tableData.map((row) => {
                    const { partdescription, ...rest } = row; // remove both
                    return {
                        ...rest,
                        createdby: userId,
                        modifiedby: userId,
                        // repairername: userName
                    };
                });
           
    
            savePTLOpreatorRequest(updatedFormData)
                .then((response) => {
                    // console.log("RESPONSE:", response);
                    if (response.status === 200 && response.data) {
                        const { message } = response.data;
                        setSuccessMessage(message || "Saved successfully");
                        setShowSuccessPopup(true);
                        setTableData([]);
                        setShowTable(false);
                        // setIsFrozen(false);
                        // handleClear();
                        // if (typeof handleClear === "function") handleClear();
                    } else {
                        setErrorMessage(response.data?.message || "Unknown error");
                        setShowErrorPopup(true);
                        setTableData([]);
                        setShowTable(false);
                    }
                })
                .catch((error) => {
                    // console.log("ERROR:", error);
                    const errMsg = error?.response?.data?.message || "Network error, please try again";
                    setErrorMessage(errMsg);
                    setShowErrorPopup(true);
                }) .finally(() => {
        setLoading(false);
    });
        };
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>PTL Request</p>
                </div>
                <PTLRequestTextFiled
                    formData={formData}
                    rcMainStore={rcMainStore}
                    setFormData={setFormData}
                    formErrors={formErrors} // ✅ Pass this prop
                    setFormErrors={setFormErrors}
                    handleChange={handleChange}

                />
                <div className="ComCssButton9">
                    <button className='ComCssSubmitButton'    onClick={handleAddClick} >ADD</button>
                </div>

               

            </div>
             {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>
                                <LoadingOverlay loading={loading} />

                    <PTLRequestAddTable
                        data={tableData}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        loading={false}
                        setPage={setPage}
                        setShowTable={setShowTable}
                        setPerPage={setPerPage}
                        setFormData={setFormData}
                        setIsFrozen={setIsFrozen}
                        setTableData={setTableData}
                    />
                    <div className="ComCssButton9">
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit} >Submit</button>

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
        </div>
        
        )
}

export default PTLRequest