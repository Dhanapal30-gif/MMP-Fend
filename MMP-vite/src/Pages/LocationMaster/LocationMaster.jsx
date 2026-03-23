import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Grid, Box } from "@mui/material";
import { getLocationMaster, saveLocationMaster } from "../../Services/Services";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import LocationMasterTable from "../../components/LocationMaster/LocationMasterTable";

const LocationMaster = () => {
    const initialForm = {
        locationName: ""
    };
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [storeLocationMaster, setStoreLocationMaster] = useState([]);
    const [perPage, setPerPage] = useState(20);
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validate = () => {
        let newErrors = {};

        if (!formData.locationName.trim()) {
            newErrors.locationName = "Location Name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClear = () => {
        setFormData(initialForm);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;
        const createdby = localStorage.getItem("userName") || "System";
        const updatedby = localStorage.getItem("userName") || "System";
        const updatedFormData = {
            ...formData,
            createdby,
            updatedby,
        };
        saveLocationMaster(updatedFormData)
            .then((response) => {
                //alert("Product added Successfully");
                setSuccessMessage("ProductQty Master Created");
                setShowSuccessPopup(true);
                setFormData({
                    locationName:""
                })
                fetchLocationMaster();
                // setResetKey(prev => prev + 1);
                // fetchBomMaster()
                // formClear();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 409) {
                        //alert("Product already exists");
                        setShowErrorPopup(true);
                        setErrorMessage("LocationName already exists")
                        handleClear();
                    } else {
                        //alert(error.response.status);
                        setShowErrorPopup(true);
                        setErrorMessage(error.response.status)
                    }
                }
            })
            .finally(() => {
                // formClear();
                setLoading(false)
            })
        // console.log("Submit Data :", formData);

        // API call here
    };
    useEffect(() => {
        fetchLocationMaster();
    }, [])

    const fetchLocationMaster = () => {
        getLocationMaster()
            .then((response) => {
                setStoreLocationMaster(response.data)
            })
    }
    return (
        <div className="ComCssContainer">
            <div className="ComCssInput">

                <Box className="ComCssFiledName">
                    <p>Location Master</p>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Location Name"
                                name="locationName"
                                value={formData.locationName}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                error={Boolean(errors.locationName)}
                                helperText={errors.locationName}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            {/* <Button
                                variant="contained"
                                type="submit"
                                sx={{ mr: 2 }}
                            >
                                Submit
                            </Button> */}

                            <Button
                                variant="outlined"
                                onClick={handleClear}
                            >
                                Clear
                            </Button>
                        </Grid>

                    </Grid>
                </form>

            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Location List</h5>
                <LocationMasterTable
                    data={storeLocationMaster}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    setPage={setPage}
                    setPerPage={setPerPage}
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

export default LocationMaster;