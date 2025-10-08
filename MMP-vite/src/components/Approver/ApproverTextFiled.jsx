import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';

const ApproverTextFiled = ({
    formData,
    handleChange,
    approverTicketsL1,
    approverTicketsL2,
    approverReturningTicketsL1,
    approverReturningTicketsL2
}) => {

    const allTickets = approverTicketsL1.concat(approverTicketsL2).concat(approverReturningTicketsL1).concat(approverReturningTicketsL2) || [];

    // Filter options based on any selected value
    const filteredTickets = allTickets.filter(item => 
        !formData.requestType && !formData.requestId
        || item.requestertype === formData.requestType
        || item.RequesterId === formData.requestId
    );

    const filteredRequestTypes = allTickets
        .filter(item => !formData.rec_ticket_no || item.rec_ticket_no === formData.rec_ticket_no)
        .filter(item => !formData.requestId || item.RequesterId === formData.requestId)
        .map(item => item.requestertype)
        .filter((v, i, a) => a.indexOf(v) === i); // unique

    const filteredRequestIds = allTickets
        .filter(item => !formData.rec_ticket_no || item.rec_ticket_no === formData.rec_ticket_no)
        .filter(item => !formData.requestType || item.requestertype === formData.requestType)
        .map(item => item.RequesterId)
        .filter((v, i, a) => a.indexOf(v) === i); // unique

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>

                {/* Ticket Dropdown */}
                <Autocomplete
                    options={filteredTickets}
                    value={allTickets.find(item => item.rec_ticket_no === formData.rec_ticket_no) || null}
                    getOptionLabel={(option) => option.rec_ticket_no || ""}
                    isOptionEqualToValue={(option, value) =>
                        option.rec_ticket_no === value?.rec_ticket_no
                    }
                    onChange={(e, newValue) => {
                        handleChange("rec_ticket_no", newValue?.rec_ticket_no || "");
                        handleChange("requestType", newValue?.requestertype || "");
                        handleChange("requestId", newValue?.RequesterId || "");
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Approve Ticket" size="small" />
                    )}
                />

                {/* Request Type Dropdown */}
                <Autocomplete
                    options={filteredRequestTypes}
                    value={formData.requestType || null}
                    onChange={(e, newValue) => {
                        handleChange("requestType", newValue || "");
                        const ticket = allTickets.find(item => item.requestertype === newValue);
                        handleChange("rec_ticket_no", ticket?.rec_ticket_no || "");
                        handleChange("requestId", ticket?.RequesterId || "");
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Request Type" size="small" />
                    )}
                />

                {/* Request Id Dropdown */}
                <Autocomplete
                    options={filteredRequestIds}
                    value={formData.requestId || null}
                    onChange={(e, newValue) => {
                        handleChange("requestId", newValue || "");
                        const ticket = allTickets.find(item => item.RequesterId === newValue);
                        handleChange("rec_ticket_no", ticket?.rec_ticket_no || "");
                        handleChange("requestType", ticket?.requestertype || "");
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Request Id" size="small" />
                    )}
                />

            </ThemeProvider>
        </div>
    );
}

export default ApproverTextFiled;
