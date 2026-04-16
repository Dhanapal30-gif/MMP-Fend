import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";


const UnitConsumptionTextfiled = ({
  formData,
  setFormData,
  productDetail,
  componentUsage

}) => {
  // useEffect(() => {
  //     if (!formData.dateyear) {
  //         const now = new Date();
  //         const monthStr = now.toISOString().slice(0, 7); // "YYYY-MM"
  //         setFormData(prev => ({ ...prev, dateyear: monthStr }));
  //     }
  // }, [formData.dateyear, setFormData]);

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




  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <Autocomplete
          options={productDetail}
          getOptionLabel={(option) => option[0] || ""}
          value={
            productDetail.find(
              (item) => item[0] === formData.productname
            ) || null
          }
          onChange={(event, newValue) => {
            if (newValue) {
              setFormData((prev) => ({
                ...prev,   // ✅ KEEP existing values
                productname: newValue[0],
                productgroup: newValue[1],
                productfamily: newValue[2]
              }));
            } else {
              setFormData((prev) => ({
                ...prev,
                productname: "",
                productgroup: "",
                productfamily: ""
              }));
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product Name"
              size="small"
              fullWidth
            />

          )}
        />

        <TextField
          label="Product Group"
          size="small"
          fullWidth
          value={formData.productgroup || ""}
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Product Family"
          size="small"
          fullWidth
          value={formData.productfamily || ""}
          InputProps={{ readOnly: true }}
        />
        {/* <Autocomplete
          options={componentUsage || []}
          value={formData.componentUsage || null}
          onChange={(event, newValue) => {
            setFormData(prev => ({
              ...prev,
              componentUsage: newValue || ""
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Component Usage"
              size="small"
              fullWidth
            />
          )}
        /> */}
        <TextField
          label="Month & Year"
          InputLabelProps={{ shrink: true }}
          type="month"
          size="small"
          fullWidth
          value={formData.monthYear || ""}
          onChange={(e) =>
          setFormData(prev => ({ ...prev, monthYear: e.target.value }))
          }
        />
      </ThemeProvider>
    </div>)
}

export default UnitConsumptionTextfiled