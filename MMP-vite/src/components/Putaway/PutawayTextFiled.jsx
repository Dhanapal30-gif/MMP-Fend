import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'

const PutawayTextFiled = ({
  formData,
  handleChange,
  poDropdownOptions,
  onSelectPonumber,
  setFormData,
  handlePutawayChange
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

  //console.log("poDropdownOptions", poDropdownOptions);
  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <Autocomplete
          options={poDropdownOptions || []}
          value={formData.RecevingTicketNo || null}
          getOptionLabel={(option) => option}
          isOptionEqualToValue={(option, value) => option === value}
          onChange={(e, newValue) => handleChange("RecevingTicketNo", newValue || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Receiving Ticket"
              variant="outlined"
              size="small"
              sx={{
                background: "linear-gradient(to right, #b8efddff, #ffcc70)",
                borderRadius: "8px",
              }}
            />
          )}
        />



        <Autocomplete
          options={statusOptions}
          getOptionLabel={(option) => option.label}
          //   value={getOptionObj(formData.year, yearOptions)}
          //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Returning Ticket" variant="outlined" size="small" sx={{
              background: "linear-gradient(to right, #b2e9d8ff, #d63498ff)",
              borderRadius: "8px"
            }} />
          )}
        />
        <Autocomplete
          options={TransferType}
          getOptionLabel={(option) => option.label}
          //   value={getOptionObj(formData.year, yearOptions)}
          //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Transfer Type" variant="outlined" size="small" sx={{
              background: "linear-gradient(to right, #b8efddff, #ffcc70)",
              borderRadius: "8px"
            }} />
          )}
        />
        <Autocomplete
          options={statusOptions}
          getOptionLabel={(option) => option.label}
          //   value={getOptionObj(formData.year, yearOptions)}
          //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Stock Transfer Ticket" variant="outlined" size="small" sx={{
              background: "linear-gradient(to right, #b2e9d8ff, #d63498ff)",
              borderRadius: "8px"
            }} />
          )}
        />



      </ThemeProvider>
    </div>
  )
}

export default PutawayTextFiled