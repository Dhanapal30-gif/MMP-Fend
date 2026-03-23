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
          value={formData.reworkername || []}
          onChange={(e, newValue) =>
            handleChange("reworkername", newValue)
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



        {/* <Autocomplete
          multiple
          options={shifyOption}
          readOnly={isFrozen}
          value={shifyOption.filter(o => formData.shift?.includes(o.value))}
          getOptionLabel={(option) => option.label}
          onChange={(e, newValue) =>
            handleChange(
              "shift",
              newValue.map((item) => item.value)
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              error={Boolean(formErrors?.shift)}
              helperText={formErrors?.shift || ""}
              label="Shift Type"
              variant="outlined"
              size="small"
            />
          )}
        /> */}

        <Autocomplete
  options={shifyOption}
  readOnly={isFrozen}
  value={shifyOption.find(o => o.value === formData.shift) || null}
  getOptionLabel={(option) => option.label}
  onChange={(e, newValue) =>
    handleChange("shift", newValue ? newValue.value : "")
  }
  renderInput={(params) => (
    <TextField
      {...params}
      error={Boolean(formErrors?.shift)}
      helperText={formErrors?.shift || ""}
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
          value={formData.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          error={Boolean(formErrors?.startDate)}
          helperText={formErrors?.startDate || ""}
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
          value={formData.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
          error={Boolean(formErrors?.endDate)}
          helperText={formErrors?.endDate || ""}
          InputLabelProps={{
            shrink: true, // important to show label above date field
          }}
        />

      </ThemeProvider>
    </div>
  )
}

export default LocalSummaryReportText