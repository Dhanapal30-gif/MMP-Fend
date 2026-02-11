import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";

const ReworkerTextFiled7 = ({ formData, setFormData, isFrozen,
    typeOptions, groupOptions, nameOptions, serialOptions,
    partOptions, handleChange, productOptions, handlePoChange, formErrors }) => {
    const RepaierType = [
        { label: "SUI", value: "SUI" },
        { label: "Rework", value: "Rework" },
        { label: "RND", value: "RND" },
        { label: "Soldring", value: "Soldring" },
        { label: "Desoldring", value: "Desoldring" },
        { label: "Track change", value: "Trackchange" },
        { label: "Reflow", value: "Reflow" },
        { label: "BGA", value: "BGA" },
        { label: "Swap", value: "Swap" },
        { label: "Thermal GEL", value: "Thermal GEL" }
    ];
    const getOptionObj = (value, options) => {
        return options.find((opt) => opt.value === value) || null;
    };
    // console.log("formData",formData)
    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <Autocomplete
                    options={typeOptions}
                    getOptionLabel={(option) => option.label}
                    value={getOptionObj(formData.Type, typeOptions)}
                    onChange={(e, newValue) => handlePoChange("Type", newValue?.value || "")}
                    disabled={isFrozen}
                    renderInput={(params) => <TextField {...params} label="Type" size="small" />}
                />

                <Autocomplete
                    options={groupOptions}
                    getOptionLabel={(option) => option.label}
                    value={getOptionObj(formData.ProductGroup, groupOptions)}
                    onChange={(e, newValue) => handlePoChange("ProductGroup", newValue?.value || "")}
                    disabled={isFrozen}
                    renderInput={(params) => <TextField {...params} label="ProductGroup" size="small" />}
                />

                <Autocomplete
                    options={nameOptions}
                    getOptionLabel={(option) => option.label}
                    value={getOptionObj(formData.ProductName, nameOptions)}
                    onChange={(e, newValue) => handlePoChange("ProductName", newValue?.value || "")}
                    disabled={isFrozen}
                    renderInput={(params) => <TextField {...params} label="ProductName" size="small" />}
                />

                <Autocomplete
                    options={serialOptions}
                    getOptionLabel={(option) => option.label}
                    value={getOptionObj(formData.boardserialnumber, serialOptions)}
                    onChange={(e, newValue) => handlePoChange("boardserialnumber", newValue?.value || "")}
                    disabled={isFrozen}
                    renderInput={(params) => <TextField {...params} label="Module Serial Number" size="small" />}
                />
               
                <TextField
                    label="Comments"
                    name="ReworkerComments"
                    value={formData.ReworkerComments || ""}
                    onChange={handleChange}
                    error={Boolean(formErrors?.ReworkerComments)}
                    helperText={formErrors?.ReworkerComments || ""}
                    multiline
                    disabled={!isFrozen}
                    minRows={1}
                />
                
            </ThemeProvider>
        </div>
    )
}

export default ReworkerTextFiled7