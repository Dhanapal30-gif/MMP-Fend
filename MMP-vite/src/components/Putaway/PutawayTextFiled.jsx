import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';

const PutawayTextFiled = ({
 formData,
  handleChange,
  poDropdownOptions
}) => {
  

  const statusOptions = [
    { label: "Open", value: "Open" },
    { label: "Close", value: "Close" },
    { label: "Manual Close", value: "Manual Close" },
    { label: "Canceled", value: "Canceled" },
    { label: "On Hold", value: "On Hold" }
  ];

  const TransferType = [
    { label: "Internal Transfer", value: "Internal Transfer" },
    { label: "DHL Transfer", value: "DHL Transfer" },
    
  ];
  
console.log("poDropdownOptions", poDropdownOptions);
  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
<Autocomplete
  options={poDropdownOptions || []}
  getOptionLabel={(option) => option}
  isOptionEqualToValue={(option, value) => option === value}
  value={formData.RecevingTicketNo || null}
  onChange={(e, newValue) => handleChange("RecevingTicketNo", newValue || "")}
  renderInput={(params) => (
    <TextField {...params} label="Receiving Ticket" variant="outlined" size="small" />
  )}
/>


<Autocomplete
          options={statusOptions}
          getOptionLabel={(option) => option.label}
        //   value={getOptionObj(formData.year, yearOptions)}
        //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Returning Ticket" variant="outlined" size="small" />
          )}
        />
        <Autocomplete
          options={TransferType}
          getOptionLabel={(option) => option.label}
        //   value={getOptionObj(formData.year, yearOptions)}
        //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Transfer Type" variant="outlined" size="small" />
          )}
        />
        <Autocomplete
          options={statusOptions}
          getOptionLabel={(option) => option.label}
        //   value={getOptionObj(formData.year, yearOptions)}
        //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Stock Transfer Ticket" variant="outlined" size="small" />
          )}
        />
      


      </ThemeProvider>
    </div>
  )
}

export default PutawayTextFiled