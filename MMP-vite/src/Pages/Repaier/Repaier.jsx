import React, { useState, useEffect } from 'react';
import RepaierTextfile from "../../components/Repaier/RepaierTextfile";
import RepaierAddTable from "../../components/Repaier/RepaierAddTable";

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { fetchproductPtl, getLocalMaster, savePTLRepaier, savePTLStore } from '../../Services/Services_09';
import { FaTimesCircle } from "react-icons/fa";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";


const Repaier = () => {
    const [formData, setFormData] = useState({
        productname: "",
        // productfamily: "",
        // productgroup: "",
        boardserialnumber: "",
        repairelocation:"",
        type: "",
        partcode: "",
        partdescription: "",
        racklocation: "",
        availableqty: "",
        pickingqty: "",
        repairercomments: "",
        // SUINo: "",
        tgquantity: "",
        repairername: ""
    });
    const [extraFields, setExtraFields] = useState({
        productGroup: "",
        productFamily: "",
        SUINo: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [table1Data, setTable1Data] = useState([]);
    const [table2Data, setTable2Data] = useState([]);
    const [table3Data, setTable3Data] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isFrozen, setIsFrozen] = useState(false);
    const [suiData, setSuiData] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const numericValue = value.replace(/\D/g, "");

        if (name === "pickingqty") {
            if (Number(numericValue) > Number(formData.availableqty)) {
                setErrorMessage("Picking quantity cannot be greater than available quantity")
                setShowErrorPopup(true)
                return; // stop updating
            }
        }
        setFormData(prev => ({
            ...prev,
            [name]: name === "boardserialnumber"
                ? value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 11) // allow only letters & numbers
                : value
        }));

        console.log("formData", formData)
    };

    // console.log("formData", formData)



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

        if (!formData.productname) {
            errors.productname = "Please Select Product Name";
            isValid = false;
        }

        if (!formData.type) {
            errors.type = "Please Enter Type";   // 🔴 overrides previous type error
            isValid = false;
        }

        // if (!formData.boardserialnumber?.trim()) {
        //     errors.boardserialnumber = "Enter Module Serial Number";
        //     isValid = false;
        // } else if (formData.boardserialnumber.length !== 11) {
        //     errors.boardserialnumber = "Module Serial Number must be exactly 11 characters";
        //     isValid = false;
        // }

if (!formData.boardserialnumber?.trim()) {
  errors.boardserialnumber = "Enter Module Serial Number";
  isValid = false;
} else if (formData.boardserialnumber.length > 11) {
  errors.boardserialnumber = "Module Serial Number must not exceed 11 characters";
  isValid = false;
}


        if (
            ["Soldring", "Desoldring", "Trackchange", "Reflow", "Thermal GEL", "Swap"].includes(formData.type) &&
            !formData.repairercomments
        ) {
            errors.repairercomments = "Please enter Comments";
            isValid = false;
        }

        if (
            ["Thermal GEL"].includes(formData.type) &&
            !formData.tgquantity
        ) {
            errors.tgquantity = "Please enter Quantity";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const addValiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.type) {
            errors.type = "Please Select Type";
            isValid = false;
        }

        if (formData.type === "RND" || formData.type === "Rework" || formData.type === "BGA") {
            if (!formData.partcode) {
                errors.partcode = "Please Enter Partcode";
                isValid = false;
            }
        }

        if (!formData.productname) {
            errors.productname = "Please Enter Product Name";
            isValid = false;
        }



        // if (!formData.boardserialnumber?.trim()) {
        //     errors.boardserialnumber = "Enter Module Serial Number";
        //     isValid = false;
        // } else if (formData.boardserialnumber.length !== 11) {
        //     errors.boardserialnumber = "Module Serial Number must be exactly 11 characters";
        //     isValid = false;
        // }

        if (!formData.boardserialnumber?.trim()) {
  errors.boardserialnumber = "Enter Module Serial Number";
  isValid = false;
} else if (formData.boardserialnumber.length > 11) {
  errors.boardserialnumber = "Module Serial Number must not exceed 11 characters";
  isValid = false;
}
        if (formData.type === "RND" || formData.type === "Rework" || formData.type === "BGA") {
            if (!formData.pickingqty) {
                errors.pickingqty = "Please Enter Picking Qty";
                isValid = false;
            }
        }

        if (
            ["Soldring", "Desoldring", "Trackchange", "Reflow", "Thermal GEL", "Swap"].includes(formData.type) &&
            !formData.repairercomments
        ) {
            errors.repairercomments = "Please enter Comments";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
            setLoading(true);

        // const userName = sessionStorage.getItem("userId") ;
                const userName = localStorage.getItem("userName");
// console.log("userName", userName);
        let updatedFormData;

        if (showTable) {
            updatedFormData = tableData.map((row) => {
                const { productfamily, productgroup, SUINo, Quantity, ...rest } = row; // remove both
                return {
                    ...rest,
                    createdby: userName,
                    modifiedby: userName,
                    repairername: userName
                };
            });
        } else {
            if (!valiDate()) return;
            const { productfamily, productgroup, SUINo, Quantity, quantity, ...rest } = formData; // remove both

            updatedFormData = {
                ...rest,
                createdby: userName,
                modifiedby: userName,
                repairername: userName
            };
        }

        savePTLRepaier(updatedFormData)
            .then((response) => {
                // console.log("RESPONSE:", response);
                if (response.status === 200 && response.data) {
                    const { message } = response.data;
                    setSuccessMessage(message || "Saved successfully");
                    setShowSuccessPopup(true);
                    setTableData([]);
                    setShowTable(false);
                    setIsFrozen(false);
                    handleClear();
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


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetchproductPtl();
            if (response.status === 200) {
                const { table1, table2, table3 } = response.data;
                setTable1Data(table1);
                setTable2Data(table2);
                setTable3Data(table3);

            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    // console.log("setTable1Data", table3Data);

    const productOptions = table1Data.map(item => ({
        label: item.productname,
        value: item.productname,
        productgroup: item.productgroup,
        productfamily: item.productfamily
    }));

    // const partOptions = table2Data.map(item => ({
    //     label: `${item.partcode}`,
    //     value: item.partcode,
    //     partdescription: item.partdescription,
    //     racklocation: item.racklocation,
    //     availableqty: item.quantity
    // }));

  const partOptions = table2Data || []  
  
useEffect(()=>{
 console.log("table2Data =", table2Data);
},[table2Data])


    const suiNoOptions = table3Data.map(item => ({
        label: `${item.suiNo}`,
        value: item.suiNo,
    }));

    const handleAddClick = () => {
        // if (!valiDate()) return;
        if (tableData.some(item => item.partcode === formData.partcode)) {
            setErrorMessage("Partcode Already Added")
            setShowErrorPopup(true);
            return;
        }
        if (!addValiDate()) return;

        setTableData(prev => [...prev, formData]);
        setIsFrozen(true);
        setFormData(prev => ({
            ...prev,
            // productname: "",
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
            productfamily: "",
            repairelocation:""
        }));
    };

    useEffect(() => {
        if (tableData.length > 0) {
            setShowTable(true);
        }
    }, [tableData]);
    
    // console.log("showTable:", showTable);
    // console.log("tableData:", tableData);

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
            Quantity: "",
            repairelocation:"",
        });
        setExtraFields({
            productGroup: "",
            productFamily: ""
        });
        setFormErrors({});
        setTableData([]);
        setShowTable(false);
        setIsFrozen(false);
    }

    //   useEffect(() => {
    //     if (formData.SUINo) {
    //         handleSearchClick(formData.SUINo);
    //     }
    // }, [formData.SUINo]);

    const suiDataFilter = () => {
        const suiNoOptions = tableData.map(item => ({
            label: `${item.suiNo}`,
            value: item.suiNo,
        }));


    }
    // console.log("tableda", suiData)

    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Repaier</p>
                </div>

                <RepaierTextfile
                    formData={formData}
                    handleChange={handleChange}
                    formErrors={formErrors} // ✅ Pass this prop
                    handlePoChange={handlePoChange}
                    productOptions={productOptions}
                    suiNoOptions={suiNoOptions}
                    setFormData={setFormData}
                    partOptions={partOptions}
                    isFrozen={isFrozen}
                    setExtraFields={setExtraFields}
                    extraFields={extraFields}
                    setSuiData={setSuiData}
                    setTableData={setTableData}
                    setShowTable={setShowTable}
                    setFormErrors={setFormErrors}

                />
                <div className="ComCssButton9">
                    {/* {(formData.type === "Rework" || formData.type === "RND" || formData.type === "BGA") ? (
                        <button className='ComCssSubmitButton' onClick={handleAddClick}>ADD</button>
                    ) : (
                        <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>
                    )} */}
                    {(formData.type === "Rework" || formData.type === "RND" || formData.type === "BGA") && (
                        <button className='ComCssSubmitButton' onClick={handleAddClick}>ADD</button>
                    )}

                    {(formData.type !== "SUI" && formData.type !== "Rework" && formData.type !== "RND" && formData.type !== "BGA") && (
                        <button className='ComCssSubmitButton' onClick={handleSubmit}>Submit</button>
                    )}

                    <button className='ComCssClearButton' onClick={handleClear}> Clear </button>
                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>
                    <h5 className='ComCssTableName'>ADD Board</h5>
                                <LoadingOverlay loading={loading} />

                    <RepaierAddTable
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
                        {tableData.length !=0 &&
                        <>
                        <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>
                     <button className='ComCssClearButton' onClick={handleClear}> Cancel </button>
                      </>
                         }

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