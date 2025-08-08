import React, { useState, useEffect } from 'react';
import RepaierTextfile from "../../components/Repaier/RepaierTextfile";
import RepaierAddTable from "../../components/Repaier/RepaierAddTable";

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchproductPtl, getLocalMaster, savePTLRepaier, savePTLStore } from '../../Services/Services_09';


const Repaier = () => {
    const [formData, setFormData] = useState({
        productname: "",
        productfamily: "",
        productgroup: "",
        boardserialnumber: "",
        type: "",
        partcode: "",
        partdescription: "",
        racklocation: "",
        availableqty: "",
        pickingqty: "",
        repairercomments: "",
        SUINo: "",
        Quantity: "",
        repaierName: ""
    });

    const [formErrors, setFormErrors] = useState({});
    const [table1Data, setTable1Data] = useState([]);
    const [table2Data, setTable2Data] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isFrozen, setIsFrozen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "boardserialnumber") {
            // Allow only digits and max 11 characters
            const digitOnly = value.replace(/\D/g, "").slice(0, 11);
            setFormData((prev) => ({ ...prev, [name]: digitOnly }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };


    const handlePoChange = (name, value) => {
        const newData = {
            ...formData,
            [name]: value
        };
        setFormData(newData);
    };
    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.type) {
            errors.type = "Please Select Type";
            isValid = false;
        }

        if (!formData.partcode) {
            errors.partcode = "Please Enter Partcode";
            isValid = false;
        }

        if (!formData.productname) {
            errors.productname = "Please Enter Product Name";
            isValid = false;
        }

        if (!formData.boardserialnumber?.trim()) {
    errors.boardserialnumber = "Enter Module Serial Number";
    isValid = false;
} else if (formData.boardserialnumber.length !== 11) {
    errors.boardserialnumber = "Module Serial Number must be exactly 11 characters";
    isValid = false;
}

if (!formData.pickingqty) {
            errors.pickingqty = "Please Enter Picking Qty";
            isValid = false;
        }
        if (!formData.pickingqty) {
            errors.pickingqty = "Please Enter Picking Qty";
            isValid = false;
        }

        if (
            ["Soldring", "Desoldring", "Trackchange", "Reflow", "ThermalGEL", "Swap"].includes(formData.type) &&
            !formData.repairercomments
        ) {
            errors.repairercomments = "Please enter Comments";
            isValid = false;
        }

        if (
            ["SUINo"].includes(formData.type) &&
            !formData.SUINo
        ) {
            errors.SUINo = "Please Enter SUINo";
            isValid = false;
        }


        if (
            ["Quantity"].includes(formData.type) &&
            !formData.Quantity
        ) {
            errors.Quantity = "Please Enter Quantity";
            isValid = false;
        }

        // if (!formData.Quantity) {
        //     errors.Quantity = "Please Enter Quantity";
        //     isValid = false;
        // }

        setFormErrors(errors);
        return isValid;
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!showTable && !valiDate()) return;

        const userName = sessionStorage.getItem("userName") || "System";

        const updatedFormData = tableData.map((row) => ({
            ...row,
            createdby: userName,
            modifiedby: userName,
            repaierName: userName
        }));

        savePTLRepaier(updatedFormData)
            .then((response) => {
                console.log("RESPONSE:", response);
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setTableData([]);
                    setShowTable(false);
                    setIsFrozen(false);
                    // ✅ only call if it exists
                    if (typeof handleClear === "function") handleClear();
                } else {
                    setErrorMessage(response.data?.message || "Unknown error");
                    setShowErrorPopup(true);
                    setTableData([]);
                    setShowTable(false);
                }
            })
            .catch((error) => {
                console.log("ERROR:", error);
                const errMsg = error?.response?.data?.message || "Network error, please try again";
                setErrorMessage(errMsg);
                setShowErrorPopup(true);
            });

    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetchproductPtl();
            if (response.status === 200) {
                const { table1, table2 } = response.data;
                setTable1Data(table1);
                setTable2Data(table2);
            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    console.log("setTable1Data", table2Data);

    const productOptions = table1Data.map(item => ({
        label: item.productname,
        value: item.productname,
        productgroup: item.productgroup,
        productfamily: item.productfamily
    }));

    const partOptions = table2Data.map(item => ({
        label: `${item.partcode}`,
        value: item.partcode,
        partdescription: item.partdescription,
        racklocation: item.racklocation,
        availableqty: item.quantity
    }));

    const handleAddClick = () => {
        if (!valiDate()) return;

        setTableData(prev => [...prev, formData]);
        setIsFrozen(true);
        setFormData(prev => ({
            ...prev,
            productname: "",
            //  boardserialnumber: "",
            // Type: "",
            partcode: "",
            partdescription: "",
            racklocation: "",
            availableqty: "",
            pickingqty: "",
            repairercomments: "",
            SUINo: "",
            Quantity: "",
            productgroup: "",
            productfamily: ""
        }));
    };


    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);
    console.log("showTable:", showTable);
    console.log("tableData:", tableData);

    const handleClear = () => {
        setFormData({
            productname: "",
            productfamily: "",
            productgroup: "",
            boardserialnumber: "",
            type: "",
            partcode: "",
            partdescription: "",
            racklocation: "",
            availableqty: "",
            pickingqty: "",
            repairercomments: "",
            SUINo: "",
            Quantity: ""
        });
        setFormErrors({});
         setTableData([]);
        setShowTable(false);
        setIsFrozen(false);
    }
    
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>Repaier</h5>
                </div>

                <RepaierTextfile
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors} // ✅ Pass this prop
                    handlePoChange={handlePoChange}
                    productOptions={productOptions}
                    setFormData={setFormData}
                    partOptions={partOptions}
                    isFrozen={isFrozen}

                />
                <div className="ComCssButton9">
                    {(formData.type === "Rework" || formData.type === "RND" || formData.type === "BGA") ? (
                        <button style={{ backgroundColor: 'green' }} onClick={handleAddClick}>ADD</button>
                    ) : (
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>
                    )}
                    <button onClick={handleClear}> Clear </button>
                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>

                    <RepaierAddTable
                        data={tableData}
                        page={page}
                        perPage={perPage}
                        totalRows={tableData.length}
                        loading={false}
                        setPage={setPage}
                        setPerPage={setPerPage}
                    />
                    <div className="ComCssButton9">
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>

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

export default Repaier