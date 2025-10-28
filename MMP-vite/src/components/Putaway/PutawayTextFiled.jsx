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
  returningOptions,
  handlePutawayChange,
  transferTicketNoList
}) => {


  const statusOptions = [
    { label: "Open", value: "Open" },
    { label: "Close", value: "Close" },
    { label: "Manual Close", value: "Manual Close" },
    { label: "Canceled", value: "Canceled" },
    { label: "On Hold", value: "On Hold" }
  ];

  const TransferTypeOption = [
    { label: "Internal Transfer", value: "Internal Transfer" },
    { label: "DHL Transfer", value: "DHL Transfer" },

  ];

  //  const transferPartcodeOptions = React.useMemo(() =>
  //         transferTicketNoList.map(item => ({
  //             label: item.partcode,
  //             value: item.partcode
  //         })),
  //         [transferTicketNoList]

  //     ); 



  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <Autocomplete
          options={poDropdownOptions || []}
          value={formData.RecevingTicketNo || null}
          getOptionLabel={(option) => option}
          isOptionEqualToValue={(option, value) => option === value}
          onChange={(e, newValue) => {
            // Delay state update to let Autocomplete finish selection
            setTimeout(() => handleChange("RecevingTicketNo", newValue), 0);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Receiving Ticket (7987)"
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
          options={returningOptions || []}
          value={formData.ReturningTicket || null}
          getOptionLabel={(option) => option}
          isOptionEqualToValue={(option, value) => option === value}
          onChange={(e, newValue) => {
            // Delay state update to let Autocomplete finish selection
            setTimeout(() => handleChange("ReturningTicket", newValue), 0);
          }}
          // onChange={(e, newValue) => handleChange("ReturningTicket", newValue || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Returning Ticket"
              variant="outlined"
              size="small"
              sx={{
                background: "linear-gradient(to right, #b8efddff, #ef53c6ff)",
                borderRadius: "8px",
              }}
            />
          )}
        />
        <Autocomplete
          options={TransferTypeOption}
          getOptionLabel={(option) => option.label}
          value={TransferTypeOption.find(opt => opt.value === formData.transferType) || null}
          isOptionEqualToValue={(option, value) => option.value === value?.value}
          onChange={(e, newValue) => {
            setTimeout(() => handleChange("transferType", newValue?.value || ""), 0);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Stock Transfer Type"
              variant="outlined"
              size="small"
              sx={{
                background: "linear-gradient(to right, #b8efddff, #ffcc70)",
                borderRadius: "8px"
              }}
            />
          )}
        />

        <Autocomplete
          options={transferTicketNoList || []}
          getOptionLabel={(option) => option.InternalTicketNo || ""}
          value={
            transferTicketNoList.find(
              (opt) => opt.InternalTicketNo === formData.StockTransferTicketNo
            ) || null
          }
          isOptionEqualToValue={(option, value) =>
            option.InternalTicketNo === value?.InternalTicketNo
          }
          onChange={(e, newValue) => {
            setTimeout(() => handleChange("StockTransferTicketNo", newValue?.InternalTicketNo || ""), 0);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Stock Transfer Ticket"
              variant="outlined"
              size="small"
              sx={{
                background: "linear-gradient(to right, #b8efddff, #ef53c6ff)",
                borderRadius: "8px"
              }}
            />
          )}
        />




        {/* <Autocomplete
          options={transferTicketNoList}
          getOptionLabel={(option) => option.label}
          //   value={getOptionObj(formData.year, yearOptions)}
          //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Stock Transfer Ticket" variant="outlined" size="small" sx={{
              background: "linear-gradient(to right, #b2e9d8ff, #d63498ff)",
              borderRadius: "8px"
            }} />
          )}
        /> */}



      </ThemeProvider>
    </div>
  )
}

export default PutawayTextFiled