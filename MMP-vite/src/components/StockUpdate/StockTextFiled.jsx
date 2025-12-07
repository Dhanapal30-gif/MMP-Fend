import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'
import ComTextFiled from '../Com_Component/ComTextFiled';

const StockTextFiled = ({
    formData,
    handleChange,
    partcodeList,
    prtcodeDetailsList,
    setErrorMessage,
    setShowErrorPopup,
    productandPartcode,
    compatibilityData,
    formErrors,
    isFrozen,
    isEditMode
}) => {
    const [locationOptions, setLocationOptions] = useState([]);
    const [avilabeQty, setAvilabeQty] = useState(0);


    const stockUpdateType = [
        { label: "Faulty Component", value: "Faulty Component" },
        { label: "Manual Stock Count ", value: "Manual Stock Count" },

    ];
    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>

                <Autocomplete
                    options={stockUpdateType} // ternary
                    // readOnly={isFrozen}
                    value={formData.stockUpdateType || null} // null if empty
                    getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                    }
                    // onChange={(e, newValue) => handleChange("requestFor", newValue)}
                    onChange={(e, newValue) =>
                        handleChange(
                            "stockUpdateType",
                            typeof newValue === "string" ? { label: newValue, value: newValue } : newValue
                        )
                    }
                    renderInput={(params) => (
                        <TextField {...params}
                            error={Boolean(formErrors?.stockUpdateType)}
                            helperText={formErrors?.stockUpdateType || ""}
                            label="Stock UpdateType" variant="outlined" size="small" />
                    )}
                />


                <Autocomplete
                    options={partcodeList}
                    value={formData.partcode}
                    getOptionLabel={(option) => option?.partcode || ""}
                    isOptionEqualToValue={(option, value) => option?.partcode === value?.partcode}
                    onChange={(e, newValue) => {
                        handleChange("partcode", newValue);

                        // Reset dependent fields when partcode changes
                        handleChange("batchCode", null);
                        handleChange("Location", null);
                        handleChange("avilabeQty", 0);
                        setLocationOptions([]);
                        setAvilabeQty(0);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Partcode"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                readOnly: isFrozen,
                                style: { color: "#000" }
                            }}
                            error={Boolean(formErrors?.partcode)}
                            helperText={formErrors?.partcode || ""}
                        />
                    )}
                />

                <Autocomplete
                    options={[
                        ...new Map(prtcodeDetailsList.map(item => [item.batchCode, item])).values()
                    ]} // deduplicated by batchCode
                    value={formData.batchCode}
                    getOptionLabel={(option) => option?.batchCode || ""}
                    isOptionEqualToValue={(option, value) => option?.batchCode === value?.batchCode}
                    onChange={(e, newValue) => {
                        handleChange("batchCode", newValue);

                        // filter locations for this batchcode
                        if (newValue) {
                            const locs = prtcodeDetailsList
                                .filter(item => item.batchCode === newValue.batchCode)
                                .map(item => ({ Location: item.Location, avilabeQty: item.avilabeQty }));
                            setLocationOptions(locs);

                            // reset location and qty when batchcode changes
                            handleChange("Location", null);
                            setAvilabeQty(0);
                        } else {
                            setLocationOptions([]);
                            handleChange("Location", null);
                            setAvilabeQty(0);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="BatchCode" size="small"
                            error={Boolean(formErrors?.batchCode)}
                            helperText={formErrors?.batchCode || ""}
                        />
                    )}
                />
                <Autocomplete
                    options={locationOptions}
                    value={formData.Location} // must be object from locationOptions
                    getOptionLabel={(option) => option?.Location || ""}
                    isOptionEqualToValue={(option, value) => option?.Location === value?.Location}
                    onChange={(e, newValue) => {
                        handleChange("Location", newValue); // store object
                        if (newValue) {
                            setAvilabeQty(newValue.avilabeQty || 0); // match key
                            handleChange("avilabeQty", newValue.avilabeQty || 0); // match key
                        } else {
                            setAvilabeQty(0);
                            handleChange("avilabeQty", 0);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Location" size="small"
                            error={Boolean(formErrors?.Location)}
                            helperText={formErrors?.Location || ""}
                        />
                    )}
                />


                {!isEditMode &&
                    <ComTextFiled
                        label="Available Qty"
                        name="avilabeQty"
                        value={avilabeQty}
                        onChange={(e) => handleChange("avilabeQty", e.target.value)}
                    />
                }
                {isEditMode &&
                    <TextField
                        label="Available Qty"
                        name="avilabeQty"
                        value={formData.avilabeQty}
                        onChange={(e) => handleChange("avilabeQty", e.target.value)} // pass value

                    // error={Boolean(formErrors?.comments)}
                    // helperText={formErrors?.comments || ""}
                    />
                }
                <ComTextFiled
                    label={
                        formData.stockUpdateType?.value === "Faulty Component"
                            ? "Faulty Qty"
                            : formData.stockUpdateType?.value === "Manual Stock Count"
                                ? "Manual Qty"
                                : "Qty"
                    }
                    name="faultyQty"
                    value={formData.faultyQty || ""}
                    type="number"
                    onChange={(e) => {
                        const value = Number(e.target.value || 0);
                        if (value > avilabeQty) {
                            // alert("Entered qty cannot be more than available qty: " + avilabeQty);
                            setErrorMessage("Entered qty cannot be more than available qty: " + avilabeQty);
                            setShowErrorPopup(true);
                            handleChange("faultyQty", avilabeQty); // set max value
                        } else {
                            handleChange("faultyQty", value);
                        }
                    }}
                    error={Boolean(formErrors?.faultyQty)}
                    helperText={formErrors?.faultyQty || ""}
                />




                <TextField
                    label="Comments"
                    className="comTextFiled"
                    name="comments"
                    value={formData.comments}
                    onChange={(e) => handleChange("comments", e.target.value)} // pass value
                    multiline
                    minRows={1}
                    error={Boolean(formErrors?.comments)}
                    helperText={formErrors?.comments || ""}
                />


            </ThemeProvider>
        </div>
    )
}

export default StockTextFiled