import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";

const LocalndindividualReportCom = ({ formData, setFormData, isFrozen,
  typeOptions, productNameAndPartcode, handleInputChange, nameOptions, serialOptions,
  partOptions, handleChange, productOptions, handlePoChange, formErrors }) => {

  const BoardStaus = [
    { label: "Ongoing", value: "MSC00003" },
    { label: "Not Started", value: "MSC00001" },
    { label: "Closed", value: "MSC00004" },
    { label: "Cancel", value: "Cancel" },
  ];

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
          options={BoardStaus}
          getOptionLabel={(option) => option.label}
          value={getOptionObj(formData?.status, BoardStaus)}  // safe access
          onChange={(e, newValue) => handlePoChange("status", newValue?.value || "")}
          renderInput={(params) => <TextField {...params} label="Status" size="small" />}
        />
<TextField
    id="outlined-basic"
    label="BoardSerial Number"
    variant="outlined"
    name="boardserialnumber"
    value={formData.boardserialnumber || ""}
    onChange={(e) => handlePoChange(e.target.name, e.target.value)}
    size="small"
/>
<Autocomplete
  options={productNameAndPartcode.partcode || []}
  value={formData.partcode || null}
  onChange={(e, val) => setFormData({ ...formData, partcode: val })}
  renderInput={(params) => (
    <TextField {...params} label="Part Code" size="small" />
  )}
/>


   <Autocomplete
  options={productNameAndPartcode.productname || []}
  value={formData.productname || null}
  onChange={(e, val) => setFormData({ ...formData, productname: val })}
  renderInput={(params) => (
    <TextField {...params} label="Product Name" size="small" />
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

export default LocalndindividualReportCom