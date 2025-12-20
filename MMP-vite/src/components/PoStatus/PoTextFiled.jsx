import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';

const PoTextFiled = ({
  formData,
  handleChange,
  poDropdownOptions
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 3 + i;
    return { label: year.toString(), value: year.toString() };
  });

  const statusOptions = [
    { label: "Open", value: "Open" },
    { label: "Closed", value: "Closed" },
    { label: "Manual Close", value: "Manual Close" },
    { label: "Canceled", value: "Canceled" },
    { label: "On Hold", value: "On Hold" }
  ];



  const getOptionObj = (value, options) => {
    return options.find((opt) => opt.value === value) || null;
  };

  //   const ponumberOptions = [
  //   { label: "PO123", value: "PO123" },
  //   { label: "PO456", value: "PO456" },
  //   // add more or fetch dynamically
  // ];


  const { ponumberOptions, partcodeOptions, partDescriptionOptions } = poDropdownOptions;

  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>

        <Autocomplete
          options={yearOptions}
          getOptionLabel={(option) => option.label}
          value={getOptionObj(formData.year, yearOptions)}
          onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Year" variant="outlined" size="small" />
          )}
        />

        <Autocomplete
          options={statusOptions}
          getOptionLabel={(option) => option.label}
          value={getOptionObj(formData.status, statusOptions)}
          onChange={(e, newValue) => handleChange("status", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Status" variant="outlined" size="small" />
          )}
        />
        <Autocomplete
          freeSolo
          options={ponumberOptions}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          value={formData.ponumber || ""}
          onChange={(e, newValue) => {
            if (typeof newValue === 'string') {
              handleChange("ponumber", newValue);
            } else {
              handleChange("ponumber", newValue?.value || "");
            }
          }}
          onInputChange={(e, newInputValue) => {
            handleChange("ponumber", newInputValue); // update typing input
            setPonumberInput(newInputValue); // fetch suggestions dynamically
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ponumber"
              variant="outlined"
              size="small"
            />
          )}
          filterOptions={(x) => x} // allow full list
        />



        <Autocomplete
          options={partcodeOptions}
          getOptionLabel={(option) => option.label}
          value={getOptionObj(formData.partcode, partcodeOptions)}
          onChange={(e, newValue) => handleChange("partcode", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Partcode" variant="outlined" size="small" />
          )}
        />
        <Autocomplete
          options={partDescriptionOptions}
          getOptionLabel={(option) => option.label}
          value={getOptionObj(formData.partDescription, partDescriptionOptions)}
          onChange={(e, newValue) => handleChange("partDescription", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Part Description" variant="outlined" size="small" />
          )}
        />

      </ThemeProvider>
    </div>
  );
};

export default PoTextFiled;
