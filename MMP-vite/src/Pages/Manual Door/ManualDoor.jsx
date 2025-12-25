import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";
import ComTextFiled from '../../components/Com_Component/ComTextFiled'; // adjust path if needed
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme'; // adjust path if needed
import { closePTLRack, closeRcRack, getPTLRequestDetail, getRequestDetail, openPTLRack, } from '../../Services/Services-Rc';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import ManualDoorTable from "../../components/Manual Door/ManualDoorTable";


const ManualDoor = () => {



    const [formData, setFormData] = useState({
        rackName: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requestData, setRequestData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [searchText, setSearchText] = useState("");

    const RackList = [
        { label: "Rack 01", value: "Rack-1" },
        { label: "Rack 02", value: "Rack-2" },
        { label: "Rack 03", value: "Rack-3" },
        { label: "Rack 05", value: "Rack-5" },
        { label: "Rack 06", value: "Rack-6" },
        { label: "Rack 07", value: "Rack-7" },

    ];


    const handlePoChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const valiDate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.rackName) {
            errors.rackName = "select Rack Name ";
            isValid = false;
        }
        setFormErrors(errors); // if you’re using error state
        return isValid;
    };

    const handleOpen = async () => {
        if (!valiDate()) return;
        setLoading(true);
        try {
            const res = await openPTLRack(formData.rackName);
            setSuccessMessage(res.data?.message || "Saved successfully");
            setShowSuccessPopup(true);
            fetchManualRequest();
            setFormData({rackName:""})
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "An error occurred");
            setShowErrorPopup(true);
            // console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        if (!valiDate()) return;
        setLoading(true);

        try {
            const res = await closePTLRack(formData.rackName);
            setSuccessMessage(res.data?.message || "Saved successfully");
            setShowSuccessPopup(true);
            setSearchText("");
            fetchManualRequest();
            setFormData({ rackName: "" })
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "An error occurred");
            setShowErrorPopup(true);
            // console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManualRequest();
    }, [])

    const filteredData = React.useMemo(() => {
        if (!searchText) return requestData;

        const text = searchText.toLowerCase();

        return requestData.filter(row =>
            Object.values(row).some(
                val =>
                    val &&
                    val.toString().toLowerCase().includes(text)
            )
        );
    }, [requestData, searchText]);


    const fetchManualRequest = async () => {
        setLoading(true);
        try {
            const response = await getPTLRequestDetail();
            setPage(1);
            setRequestData(response.data);
            // setShowSuccessPopup(true);
            setSearchText("");

        } catch (error) {
            // Show proper error
            const message = error.response?.data?.message || error.message || "Error fetching requests";
            setErrorMessage(message);
            setShowErrorPopup(true);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='ComCssContainer'>
            <LoadingOverlay loading={loading} />
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>Manual Door</h5>
                </div>
                <div className="ComCssTexfiled">
                    <ThemeProvider theme={TextFiledTheme}>
                        <Autocomplete
                            sx={{ width: 280 }}
                            options={RackList}
                            getOptionLabel={(option) => option.label}
                            value={RackList.find(r => r.value === formData.rackName) || null}
                            onChange={(e, newValue) =>
                                handlePoChange("rackName", newValue?.value || "")
                            }
                            renderInput={(params) => (
                                <TextField {...params}
                                    error={Boolean(formErrors?.rackName)}
                                    helperText={formErrors?.rackName || ""}
                                    label="Rack" size="small" />
                            )}
                        />

                    </ThemeProvider>
                    <div className="ComCssButton9">
                        <button className='ComCssSubmitButton' onClick={handleOpen} >Open</button>
                        <button className='ComCssSubmitButton' onClick={handleClose} >Close</button>
                    </div>
                </div>
            </div>
             <div className='ComCssTable'>
                            <h5 className='ComCssTableName'>Request Detail</h5>
                            <div
                                className="d-flex justify-content-end align-items-center mb-3"
                                style={{ marginTop: "9px", display: "flex" }}>
                                <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ height: "30px", paddingRight: "30px" }}
                                        placeholder="Search..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    {searchText && (
                                        <span
                                            onClick={() => setSearchText("")} style={{
                                                position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold"
                                            }}
                                        > ✖
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ManualDoorTable
                                data={filteredData}
                                page={page}
                                perPage={perPage}
                                setPerPage={setPerPage}
                                totalRows={filteredData.length}
                                loading={false}
                                setPage={setPage}
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

export default ManualDoor