import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import TextFiledTheme from "../../components/Com_Component/TextFiledTheme";
import ComTextFiled from "../Com_Component/ComTextFiled";

const ReturningTextFiled = ({
  formData,
  handleChange,
  formErrors,
  returningData,
  handleDropdownChange,
  handleReturnQtyChange
}) => {

    const requesterForOption = [ { label: "DTL", value: "DTL" }, { label: "PTL", value: "PTL" }, ]; 
    const commentOption = [ { label: "DTL", value: "DTL" }, { label: "Harvester", value: "Harvester" }, ];

  /* ---------------- ORDER TYPE OPTIONS ---------------- */
  const orderTypeOptions = [
    ...new Set(returningData.map((item) => item.ordertype))
  ].map((v) => ({ label: v, value: v }));


  /* ---------------- REQUESTER TYPE ---------------- */
  const requesterTypeOptions = [
    ...new Set(
      returningData
        .filter((i) => i.ordertype === formData.ordertype)
        .map((i) => i.RequesterType)
    )
  ].map((v) => ({ label: v, value: v }));


  /* ---------------- PARTCODE ---------------- */
  const partCodeOptions = [
    ...new Set(
      returningData
        .filter(
          (i) =>
            i.ordertype === formData.ordertype &&
            i.RequesterType === formData.RequesterType
        )
        .map((i) => i.partcode)
    )
  ].map((v) => ({ label: v, value: v }));


  /* ---------------- TICKET NO ---------------- */
  const ticketOptions = returningData
    .filter(
      (i) =>
        i.ordertype === formData.ordertype &&
        i.RequesterType === formData.RequesterType &&
        i.partcode === formData.partcode
    )
    .map((i) => ({
      label: i.rec_ticket_no,
      value: i.rec_ticket_no
    }));


  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
 <Autocomplete
                    options={ requesterForOption} // ternary
                    // readOnly={isFrozen}
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
        {/* ORDER TYPE */}
        <Autocomplete
          options={orderTypeOptions}
          value={
            formData.ordertype
              ? { label: formData.ordertype, value: formData.ordertype }
              : null
          }
          getOptionLabel={(o) => o.label}
          onChange={(e, v) => handleDropdownChange("ordertype", v?.value || "")}
          renderInput={(params) => (
            <TextField {...params} label="Order Type" size="small" />
          )}
        />

        {/* REQUESTER TYPE */}
        <Autocomplete
          options={requesterTypeOptions}
          value={
            formData.RequesterType
              ? { label: formData.RequesterType, value: formData.RequesterType }
              : null
          }
          getOptionLabel={(o) => o.label}
          onChange={(e, v) =>
            handleDropdownChange("RequesterType", v?.value || "")
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Requester Type"
              size="small"
              error={Boolean(formErrors?.RequesterType)}
              helperText={formErrors?.RequesterType}
            />
          )}
        />

        {/* PARTCODE */}
        <Autocomplete
          options={partCodeOptions}
          value={
            formData.partcode
              ? { label: formData.partcode, value: formData.partcode }
              : null
          }
          getOptionLabel={(o) => o.label}
          onChange={(e, v) => handleDropdownChange("partcode", v?.value || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Part Code"
              size="small"
              error={Boolean(formErrors?.partcode)}
              helperText={formErrors?.partcode}
            />
          )}
        />

        {/* TICKET */}
        <Autocomplete
          options={ticketOptions}
          value={
            formData.rec_ticket_no
              ? { label: formData.rec_ticket_no, value: formData.rec_ticket_no }
              : null
          }
          getOptionLabel={(o) => o.label}
          onChange={(e, v) =>
            handleDropdownChange("rec_ticket_no", v?.value || "")
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Req Ticket No"
              size="small"
              error={Boolean(formErrors?.rec_ticket_no)}
              helperText={formErrors?.rec_ticket_no}
            />
          )}
        />

        {/* ISSUE QTY */}
        <ComTextFiled
          label="Issue Qty"
          name="IssueQty"
          value={formData.IssueQty || ""}
          disabled
        />

        {/* RETURN QTY */}
        <ComTextFiled
          label="Return Qty"
          name="returnQty"
          type="number"
          value={formData.returnQty || ""}
          onChange={(e) => handleReturnQtyChange(e.target.value)}
          error={Boolean(formErrors?.returnQty)}
          helperText={formErrors?.returnQty}
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
  );
};

export default ReturningTextFiled;