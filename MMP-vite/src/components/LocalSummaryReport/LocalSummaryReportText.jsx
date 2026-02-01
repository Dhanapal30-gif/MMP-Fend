import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'
import ComTextFiled from '../Com_Component/ComTextFiled';

const LocalSummaryReportText = ({
    formData,
    handleChange,
    shifyOption,
    requestType,
    requesterType,
    userId,
    requestTypeOption,
    productandPartcode,
    compatibilityData,
    formErrors,
    isFrozen,
    ReworkerNameList
}) => {

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                
                <Autocomplete
  
  options={ReworkerNameList}
  readOnly={isFrozen}
  value={formData.reworkerName || []}
  onChange={(e, newValue) =>
    handleChange("reworkerName", newValue)
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Reworker Name"
      variant="outlined"
      size="small"
    />
  )}
/>



                 <Autocomplete
                    multiple
                    options={shifyOption}
                    readOnly={isFrozen}
                    value={shifyOption.filter(o => formData.shiftType?.includes(o.value))}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, newValue) =>
                        handleChange(
                            "shiftType",
                            newValue.map((item) => item.value)
                        )
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={Boolean(formErrors?.shiftType)}
                            helperText={formErrors?.shiftType || ""}
                            label="Shift Type"
                            variant="outlined"
                            size="small"
                        />
                    )}
                />
                <TextField
      label="From Date"
      type="date"
      variant="outlined"
      size="small"
      fullWidth
      value={formData.reportDate}
      onChange={(e) => handleChange("reportDate", e.target.value)}
      error={Boolean(formErrors?.reportDate)}
      helperText={formErrors?.reportDate || ""}
      InputLabelProps={{
        shrink: true, // important to show label above date field
      }}
    />
    <TextField
      label="To Date"
      type="date"
      variant="outlined"
      size="small"
      fullWidth
      value={formData.reportDate}
      onChange={(e) => handleChange("reportDate", e.target.value)}
      error={Boolean(formErrors?.reportDate)}
      helperText={formErrors?.reportDate || ""}
      InputLabelProps={{
        shrink: true, // important to show label above date field
      }}
    />

            </ThemeProvider>
        </div>
    )
}

export default LocalSummaryReportText