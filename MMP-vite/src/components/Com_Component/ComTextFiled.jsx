import React from "react";
import { TextField, Autocomplete } from "@mui/material";

const ComTextField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  isAutocomplete = false,
  onAutoChange, // specific for autocomplete
error, 
helperText ,
  ...rest
}) => {
  return isAutocomplete ? (
     <Autocomplete
  options={options}
  getOptionLabel={(option) => option.label || option}
 value={options.find(opt => opt.label === value) || null}
onChange={(e, newValue) => onAutoChange(name, newValue?.label || "")}

  renderInput={(params) => (
    <TextField
      {...params}
      label={label}
      variant="outlined"
      error={error}
      helperText={helperText}
      InputProps={{
        ...params.InputProps,
        sx: { height: "35px" },
      }}
    />
    )}
    {...rest}
  />
) : (
  <TextField
    id={`${name}-field`}
    label={label}
    name={name}
    value={value}
    onChange={onChange}
    variant="outlined"
    InputProps={{ sx: { height: "35px" } }}
    error={error}
    helperText={helperText}
    {...rest}
  />
);
};

export default ComTextField;
