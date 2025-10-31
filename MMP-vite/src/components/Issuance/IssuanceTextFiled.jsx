import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'

const IssuanceTextFiled = ({
    formData,
    handleChange,
    poDropdownOptions,
    onSelectPonumber,
    setFormData,
    handlePutawayChange,
    requestTicketList,
    deliverTicketList,
    issueTicketList,
    ptlTicketList,
    ptlDeliveryTicketList,
    ptlIssueTicketList
}) => {

    const TransferType = [
        { label: "DTL", value: "DTL" },
        { label: "PTL", value: "PTL" },

    ];

    const getOptionObj = (value, options) => {
        return options.find((opt) => opt.value === value) || null;
    };

console.log("delivertivketlist",deliverTicketList)
    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>

                <Autocomplete
                    options={TransferType}
                    getOptionLabel={(option) => option.label}
                    value={getOptionObj(formData.category, TransferType)}   // fixed lowercase
                    onChange={(e, newValue) => handleChange("category", newValue?.value || "")}  // fixed lowercase
                    renderInput={(params) => (
                        <TextField {...params} label="Category" variant="outlined" size="small" sx={{
                            background: "linear-gradient(to right, #b8efddff, #ffcc70)",
                            borderRadius: "8px"
                        }} />
                    )}
                />
<Autocomplete
   options={formData.category === "DTL" ? requestTicketList : ptlTicketList || []}
  getOptionLabel={(option) => option.rec_ticket_no || ""}
  value={(formData.category === "DTL" ? requestTicketList : ptlTicketList)?.find(
    (opt) => opt.rec_ticket_no === formData.requestedTicket
  ) || null}
  onChange={(e, newValue) => {
    handleChange("requestedTicket", newValue ? newValue.rec_ticket_no : null);

    // reset dependent tickets
    handleChange("deliverTicket", null);
    handleChange("issueTicket", null);
  }}
  isOptionEqualToValue={(option, value) => option.rec_ticket_no === value.rec_ticket_no}
  renderInput={(params) => (
    <TextField {...params} 
    label="Request Ticket No" variant="outlined" sx={{ background: "linear-gradient(to right, #b8efddff, #e7e948ff)",
}} size="small" />
  )}
/>

<Autocomplete
    options={formData.category === "DTL" ? deliverTicketList : ptlDeliveryTicketList || []}
  getOptionLabel={(option) => option.rec_ticket_no || ""}
  value={(formData.category === "DTL" ? deliverTicketList : ptlDeliveryTicketList)?.find(
    (opt) => opt.rec_ticket_no === formData.deliverTicket
  ) || null}
  onChange={(e, newValue) => {
    handleChange("deliverTicket", newValue ? newValue.rec_ticket_no : null);

    // reset others
    handleChange("requestedTicket", null);
    handleChange("issueTicket", null);
  }}
  isOptionEqualToValue={(option, value) => option.rec_ticket_no === value.rec_ticket_no}
  renderInput={(params) => (
    <TextField {...params} label="Deliver Ticket No" variant="outlined"
    sx={{ background: "linear-gradient(to right, #b8efddff, #f748d7ff)",
}}
    size="small" />
  )}
/>

<Autocomplete
  options={formData.category === "DTL" ? issueTicketList : ptlIssueTicketList || []}
  getOptionLabel={(option) => option.rec_ticket_no || ""}
  value={(formData.category === "DTL" ? issueTicketList : ptlIssueTicketList)?.find(
    (opt) => opt.rec_ticket_no === formData.issueTicket
  ) || null}
  onChange={(e, newValue) => {
    handleChange("issueTicket", newValue ? newValue.rec_ticket_no : null);

    // reset others
    handleChange("requestedTicket", null);
    handleChange("deliverTicket", null);
  }}
  isOptionEqualToValue={(option, value) => option.rec_ticket_no === value.rec_ticket_no}
  renderInput={(params) => (
    <TextField {...params} label="Issue Ticket No" variant="outlined"
    sx={{ background: "linear-gradient(to right, #b8efddff, #7bd659ff)",
}}
    size="small" />
  )}
/>

            </ThemeProvider>
        </div>
    )
}

export default IssuanceTextFiled