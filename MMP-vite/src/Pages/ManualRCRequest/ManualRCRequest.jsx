import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";
import ComTextFiled from '../../components/Com_Component/ComTextFiled'; // adjust path if needed
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme'; // adjust path if needed
import { closeRcRack, getRequestDetail, openRcRack } from '../../Services/Services-Rc';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import ManualRcRequestTable from "../../components/ManualRcRequest/ManualRcRequestTable";


const ManualRCRequest = () => {

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
        { label: "Rack 4-5", value: "Rack4-5" },
        { label: "Rack 6-7", value: "Rack6-7" },
        { label: "Rack 8-9", value: "Rack8-9" },
        { label: "Rack 10-11", value: "Rack10-11" },
        { label: "Rack 12-13", value: "Rack12-13" },
        { label: "Rack 14-15", value: "Rack14-15" },
        { label: "Rack 16-17", value: "Rack16-17" },
        { label: "Rack 18-19", value: "Rack18-19" },
        { label: "Rack 20-21", value: "Rack20-21" },
        { label: "Rack 22-23", value: "Rack22-23" },
        { label: "Rack 24-25", value: "Rack24-25" },
        { label: "Rack 26-27", value: "Rack26-27" },
        { label: "Rack 28-29", value: "Rack28-29" },
        { label: "Rack 30-31", value: "Rack30-31" },
        { label: "Rack 32-33", value: "Rack32-33" },
        { label: "Rack 34-35", value: "Rack34-35" },
        { label: "Rack 36-37", value: "Rack36-37" },
        { label: "Rack 38-39", value: "Rack38-39" },
        { label: "Rack 40-41", value: "Rack40-41" },
        { label: "Rack 42-43", value: "Rack42-43" },
        { label: "Rack 44-45", value: "Rack44-45" },
        { label: "Rack 46-47", value: "Rack46-47" },
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
            const res = await openRcRack(formData.rackName);
            setSuccessMessage(res.data?.message || "Saved successfully");
            setShowSuccessPopup(true);

            fetchManualRequest();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "An error occurred");
            setShowErrorPopup(true);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async () => {
        if (!valiDate()) return;
        setLoading(true);

        try {
            const res = await closeRcRack(formData.rackName);
            setSuccessMessage(res.data?.message || "Saved successfully");
            setShowSuccessPopup(true);
            setSearchText("");
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "An error occurred");
            setShowErrorPopup(true);
            console.error(err);
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
            const response = await getRequestDetail();
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
                    <h5>Manual RC Request</h5>
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
                            // disabled={isFrozen}

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
                <ManualRcRequestTable
                    data={filteredData}
                    page={page}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    totalRows={filteredData.length}
                    loading={false}
                    // setPage={() => { }}
                    // setPerPage={() => { }}
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

export default ManualRCRequest