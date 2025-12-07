import React from "react";
import ComTextFiled from "../../components/Com_Component/ComTextFiled";
import DropdownCom from '../../components/Com_Component/DropdownCom';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import "../../Pages/GRN/GRN.css";

const GRNTextField = ({
  formData,
  handleChange,
  handleGrnChange,
  poOptions,
  partOptions,
  ticketOptions,
  showFields = [],
  formErrors
}) => {
  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>

        {showFields.includes("GRN Status") && (
          <ComTextFiled
            label="GRN Status"
            name="grnStatus"
            options={["Pending"]}
            value={"Pending"}
          />
        )}

        {showFields.includes("ponumber") && (
          <ComTextFiled
          ListboxComponent={DropdownCom}
            label="PO Number"
            name="ponumber"
            isAutocomplete
            options={poOptions}
            value={formData.ponumber}
            onAutoChange={handleChange}
          />
        )}

        {showFields.includes("partcode") && (
          <ComTextFiled
          ListboxComponent={DropdownCom}
            label="Partcode"
            name="partcode"
            isAutocomplete
            options={partOptions}
            value={formData.partcode}
            onAutoChange={handleChange}
          />
        )}

        {showFields.includes("recevingTicketNo") && (
          <ComTextFiled
          ListboxComponent={DropdownCom}
            label="Receiving Ticket No"
            name="recevingTicketNo"
            isAutocomplete
            options={ticketOptions}
            value={formData.recevingTicketNo}
            onAutoChange={handleChange}
          />
        )}
        <div className="GRNTexfiledInput">
          {showFields.includes("grnNumber") && (
            <ComTextFiled
              label="GRN Number"
              name="grnNumber"
              value={formData.grnNumber}
              onChange={handleGrnChange}
              error={Boolean(formErrors?.grnNumber)}
              helperText={formErrors?.grnNumber || ""}
            />
          )}
          {showFields.includes("GRDate") && (
            <ComTextFiled
              label="GRN Date"
              type="date"
              name="GRDate"
              InputLabelProps={{ shrink: true }}
              value={formData.GRDate}
              onChange={handleGrnChange}
              error={Boolean(formErrors?.GRDate)}
              helperText={formErrors?.GRDate || ""}
            />
          )}
        </div>
      </ThemeProvider>
    </div>
  );
};

export default GRNTextField;
