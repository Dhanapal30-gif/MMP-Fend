import React from 'react'
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";
const RecevingReportTextfiled = ({
    formData,
    setFormData,
    partcodeList,
    componentUsageList,
    handleInputChange,
    formErrors,
    handlePoChange,
    ponumberList
}) => {

    const getDateRange = (label) => {
        const endDate = new Date();
        const startDate = new Date();

        switch (label) {
            case "Last 1 Month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case "Last 3 Month":
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case "Last 6 Month":
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case "Last Year ":
                startDate.setMonth(startDate.getMonth() - 12);
                break;
            default:
                return null;
        }

        const format = (date) => date.toISOString().split('T')[0];

        return {
            startDate: format(startDate),
            endDate: format(endDate)
        };
    };

    const download = [
        "Last 1 Month",
        "Last 3 Month",
        "Last 6 Month",
        "Last Year "

    ].map(label => ({
        label,
        value: getDateRange(label)
    }));


    const getOptionObj = (value, options) => {
        return options.find((opt) => opt.value === value) || null;
    };
    const getDownloadValue = () => {
        if (!formData.download || typeof formData.download !== "object") return null;

        return download.find((opt) =>
            JSON.stringify(opt.value) === JSON.stringify(formData.download)
        ) || null;
    };

    return (


        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <Autocomplete
                    options={partcodeList || []}
                    getOptionLabel={(option) => option.partcode || ""}
                    value={partcodeList.find(p => p.partcode === formData.partcode) || null}
                    onChange={(e, newValue) => {
                        setFormData(prev => ({
                            ...prev,
                            partcode: newValue?.partcode || "",
                            partdescription: newValue?.partdescription || "",
                            // componentUsage: newValue?.componentUsage || ""
                        }));
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Partcode" size="small" />
                    )}
                />

                <TextField
                    label="Part Description"
                    size="small"
                    value={formData.partdescription || ""}
                />

                <Autocomplete
                    options={componentUsageList || []}
                    getOptionLabel={(option) => option || ""}
                    value={formData.componentUsage || null}
                    onChange={(e, val) =>
                        setFormData(prev => ({ ...prev, componentUsage: val || "" }))
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="Component Usage" size="small" />
                    )}
                />
                <Autocomplete
                    options={ponumberList || []}
                    getOptionLabel={(option) => option || ""}
                    value={formData.ponumber || null}
                    onChange={(e, val) =>
                        handlePoChange("ponumber", val || "")
                    }
                    renderInput={(params) => (
                        <TextField {...params} label="PO Number" size="small" />
                    )}
                />

                <ComTextFiled
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={handleInputChange}
                    error={Boolean(formErrors?.startDate)}
                    helperText={formErrors?.startDate || ""}
                    InputLabelProps={{ shrink: true }}
                />

                <ComTextFiled
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    error={Boolean(formErrors?.endDate)}
                    helperText={formErrors?.endDate || ""}
                    InputLabelProps={{ shrink: true }}
                />

                <Autocomplete
                    options={download}
                    getOptionLabel={(option) => option.label}
                    value={getDownloadValue()} // ✅ FIXED
                    onChange={(e, newValue) => {
                        handlePoChange("download", newValue?.value || null);   // ✅ use null, not ""
                        setFormData(prev => ({
                            ...prev,
                            download: newValue?.value || null,                   // ✅ this line ensures correct value
                            startDate: "",
                            endDate: ""
                        }));
                    }}

                    renderInput={(params) => <TextField {...params} label="Download" size="small" />}
                />



            </ThemeProvider>
        </div>
    )
}

export default RecevingReportTextfiled