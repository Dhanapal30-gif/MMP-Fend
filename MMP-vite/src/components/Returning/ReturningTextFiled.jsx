import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'
import ComTextFiled from '../Com_Component/ComTextFiled';

const ReturningTextFiled = ({
    formData,
    handleChange,
    poDropdownOptions,
    orderTypeOption,
    requestType,
    requesterType,
    userId,
    requestTypeOption,
    productandPartcode,
    compatibilityData,
    formErrors,
    isFrozen,
    returningData,
    handleDropdownChange,
    filteredData,
    handleReturnQtyChange
}) => {
    const requesterForOption = [
        { label: "DTL", value: "DTL" },
        { label: "PTL", value: "PTL" },
    ];

    const commentOption = [
        { label: "DTL", value: "DTL" },
        { label: "Harvester", value: "Harvester" },
    ];

    const getUniqueOptions = (key) => {
        return Array.from(
            new Set(filteredData.map(item => item[key]).filter(Boolean))
        ).map(val => ({ label: val, value: val }));
    };


    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <Autocomplete
                    options={ requesterForOption} // ternary
                    readOnly={isFrozen}
                    value={formData.returningType || null} // null if empty
                    getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                    }
                    onChange={(e, newValue) => handleChange("returningType", newValue)}
                    renderInput={(params) => (
                        <TextField {...params}
                            error={Boolean(formErrors?.returningType)}
                            helperText={formErrors?.returningType || ""}
                            label="Returning Type" variant="outlined" size="small" />
                    )}
                />
                {/* 
                 <Autocomplete
  options={userId.toLowerCase() === "admin" ? requesterForOption : requesterType}
  readOnly={isFrozen}
  value={
    formData.returningType
      ? { label: formData.returningType, value: formData.returningType }
      : null
  }
  getOptionLabel={(option) =>
    typeof option === "string" ? option : option.label
  }
  onChange={(e, newValue) =>
    handleChange("returningType", newValue?.value || "")
  }
  renderInput={(params) => (
    <TextField
      {...params}
      error={Boolean(formErrors?.returningType)}
      helperText={formErrors?.returningType || ""}
      label="Returning Type"
      variant="outlined"
      size="small"
    />
  )}
/> */}
                <Autocomplete
                    options={getUniqueOptions("ordertype")}
                    value={formData.ordertype ? { label: formData.ordertype, value: formData.ordertype } : null}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, newValue) => handleDropdownChange("ordertype", newValue?.value)}
                    renderInput={(params) => <TextField {...params}
                     error={Boolean(formErrors?.ordertype)}
      helperText={formErrors?.ordertype || ""} 
                    label="Order Type" size="small" />}
                />

                <Autocomplete
                    options={getUniqueOptions("Requester Type")}
                    value={formData.RequesterType ? { label: formData.RequesterType, value: formData.RequesterType } : null}
                    getOptionLabel={(option) => option.label}
                    onChange={(e, newValue) => handleDropdownChange("RequesterType", newValue?.value)}
                    renderInput={(params) => <TextField {...params} 
                      error={Boolean(formErrors?.RequesterType)}
      helperText={formErrors?.RequesterType || ""} 
                    label="Requester Type" size="small" />}
                />

                <Autocomplete
                    options={getUniqueOptions("partcode")}
                    value={formData.partcode ? { label: formData.partcode, value: formData.partcode } : null}
                    onChange={(e, newValue) => handleDropdownChange("partcode", newValue?.value)}
                    renderInput={(params) => <TextField {...params}
                      error={Boolean(formErrors?.partcode)}
      helperText={formErrors?.partcode || ""} 
                    label="Part Code" size="small" />}
                />

                <Autocomplete
                    options={getUniqueOptions("partdescription")}
                    value={formData.partdescription ? { label: formData.partdescription, value: formData.partdescription } : null}
                    onChange={(e, newValue) => handleDropdownChange("partdescription", newValue?.value)}
                    renderInput={(params) => <TextField {...params} label="Part Description" size="small" />}
                />


                <Autocomplete
                    options={returningData
                        .filter(item => item.partcode === formData.partcode)
                        .map(item => ({ label: item.rec_ticket_no, value: item.rec_ticket_no }))}
                    value={
                        formData.rec_ticket_no
                            ? { label: formData.rec_ticket_no, value: formData.rec_ticket_no }
                            : null
                    }
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value} // <-- important
                    onChange={(e, newValue) =>
                        handleDropdownChange("rec_ticket_no", newValue ? newValue.value : "")
                    }
                    renderInput={(params) => <TextField {...params} 
                      error={Boolean(formErrors?.rec_ticket_no)}
      helperText={formErrors?.rec_ticket_no || ""} 
                    label="Req Ticket No" size="small" />}
                />

                <ComTextFiled
                    label="Issue Qty"
                    name="IssueQty"
                    value={formData.IssueQty ?? ""}
                    onChange={(e) => handleChange("IssueQty", e.target.value)}
                />
                <ComTextFiled
                    label="Return Qty"
                    name="returnQty"
                    value={formData.returnQty || ""}
                    type="number"
                    onChange={(e) => handleReturnQtyChange(e.target.value)}
                    error={Boolean(formErrors?.returnQty)}
                    helperText={formErrors?.returnQty || ""}
                />


                <Autocomplete
                    options={commentOption} // ternary
                    // readOnly={isFrozen}
                    value={formData.comment || null} // null if empty
                    getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                    }
                    onChange={(e, newValue) => handleChange("comment", newValue)}
                    renderInput={(params) => (
                        <TextField {...params}
                            error={Boolean(formErrors?.comment)}
                            helperText={formErrors?.comment || ""}
                            label="Comment" variant="outlined" size="small" />
                    )}
                />
            </ThemeProvider>
        </div>

    )
}

export default ReturningTextFiled