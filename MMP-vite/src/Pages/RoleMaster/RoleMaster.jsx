import React, { useState, useEffect } from 'react';
import RoleCreation from "../../components/RoleMaster/RoleCreation";
import LocalReportIndiviualTable from "../../components/LocalndindividualReport/LocalReportIndiviualTable";
import RoleAssign from "../../components/RoleMaster/RoleAssign";
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';

const RoleMaster = () => {
    const [formData, setFormData] = useState({
        status: "",
        startDate: "",
        endDate: "",
        download: null,
    });

    const [formErrors, setFormErrors] = useState({});

    const handlePoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value === "" ? null : value   // ✅ avoid setting download: ""
        }));
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedForm = {
            ...formData,
            [name]: value,
        };

        // Reset download if either StartDate or EndDate changes
        if (name === "startDate" || name === "endDate") {
            updatedForm.download = null;
        }

        setFormData(updatedForm);
    };
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Role Master</p>
                    <RoleCreation
                        formData={formData}
                        setFormData={setFormData}
                        handlePoChange={handlePoChange}
                        handleInputChange={handleInputChange}
                        formErrors={formErrors}
                    />

                </div>
                <div className="ReworkerButton9">
                    <button style={{ backgroundColor: 'green' }} >ADD</button>
                </div>


            </div>
            
           

        </div>)
}

export default RoleMaster