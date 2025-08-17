import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";

const RoleCreation = ({ formData, setFormData, isFrozen,
  typeOptions, groupOptions, handleInputChange, nameOptions, serialOptions,
  partOptions, handleChange, productOptions, handlePoChange, formErrors }) => {

  return (
<div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <ComTextFiled
          label="Start Date"
          name="startDate"
          value={formData.startDate || ''}
          onChange={handleInputChange}
          error={Boolean(formErrors?.startDate)}
          helperText={formErrors?.startDate || ""}
        />
        <ComTextFiled
          label="Start Date"
          name="startDate"
          value={formData.startDate || ''}
          onChange={handleInputChange}
          error={Boolean(formErrors?.startDate)}
          helperText={formErrors?.startDate || ""}
        />
        </ThemeProvider>
        </div>
  )
}

export default RoleCreation