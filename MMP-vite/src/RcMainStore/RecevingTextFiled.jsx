import React, { useState, useEffect } from 'react'
import { Autocomplete, TextField } from "@mui/material";
import DropdownCom from '../COM_Component/DropdownCom';
import { Flag } from 'lucide-react';

export const RecevingTextFiled = ({
  formData,
  setFormData,
  formErrors,
  ponumber,
  onSelectPonumber,
  setPoDetail,
  setShowRecevingTable // ✅ newly added
}) => {
  return (
    <Autocomplete
      options={ponumber || []}
      ListboxComponent={DropdownCom}
      getOptionLabel={(option) => (typeof option === "string" ? option : "")}
      value={formData.ponumber || ""}
      onChange={(event, newValue) => {
        const updatedPo = newValue || "";

        setFormData((prev) => ({
          ...prev,
          ponumber: updatedPo,
          invoiceNo:"",
          invoiceDate:"",
          receivingDate:"",
          rcBactchCode:"",
        }));

        if (!updatedPo) {
          setPoDetail([]);     
          setFormData({});          // ✅ clear detail
          setShowRecevingTable(false);  // ✅ hide table
        } else {
          setShowRecevingTable(true);
          if (onSelectPonumber) {
            onSelectPonumber(updatedPo);
          }
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="PO Number"
          variant="outlined"
          error={Boolean(formErrors?.ponumber)}
          helperText={formErrors?.ponumber}
        />
      )}
    />
  );
};


export const RecevingTextFiled2 = ({ formData }) => (
  <TextField
    label="PO Number"
    name="ponumber"
    value={formData.ponumber || ""}
    InputProps={{ readOnly: true }}
    
  />
);

export const RecevingTextFiled3 = ({ formData }) => (
  <TextField
    type="date"
    label="Posting Date"
    name="postingdate"
    value={formData.postingdate || ""}
    InputProps={{ readOnly: true }}
    InputLabelProps={{ shrink: true }}
  />
);

export const RecevingTextFiled4 = ({ formData, setFormData }) => (
  <TextField
    label="Vendor Name"
    name="vendorname"
    value={formData.vendorname || ""}
    onChange={(e) => setFormData(prev => ({ ...prev, vendorname: e.target.value }))}
  />
);

export const RecevingTextFiled5 = ({ formData }) => (
  <TextField
    label="Currency Conversion Factor"
    name="ccf"
    value={formData.ccf || ""}
    InputProps={{ readOnly: true }}
  />
);

export const RecevingTextFiled6 = ({ formData }) => (
  <TextField
    label="Currency"
    name="currency"
    value={formData.currency || ""}
    InputProps={{ readOnly: true }}
  />
);

export const RecevingTextFiled7 = ({ formData }) => (
  <TextField
    label="RcBatch Code"
    name="rcBactchCode"
    value={formData.rcBactchCode || ""}
    InputProps={{ readOnly: true }}
  />
);

export const RecevingTextFiled8 = ({ formData, setFormData, formErrors }) => (
  <TextField
    variant="outlined"
    label="InvoiceNo"
    name="InvoiceNo"
    value={formData.invoiceNo || ""}
    onChange={(e) =>
      setFormData((prev) => ({ ...prev, invoiceNo: e.target.value }))
    }
    error={Boolean(formErrors?.invoiceNo)}         // ✅ safe access using optional chaining
    helperText={formErrors?.invoiceNo || ""}       // ✅ safe fallback
  // className="invoice-input"
  />
);
export const RecevingTextFiled9 = ({ formData, setFormData, formErrors }) => (
  <TextField
    type="date"
    variant="outlined"
    value={formData.invoiceDate || ""}
    InputLabelProps={{ shrink: true }}
    // className="invoice-input"

    label="Invoice Date"
    onChange={(e) => {
      const newInvoiceDate = e.target.value;
      setFormData((prev) => ({ ...prev, invoiceDate: newInvoiceDate }));

      if (
        formData.receivingDate &&
        new Date(formData.receivingDate) < new Date(newInvoiceDate)
      ) {
        setFormData((prev) => ({
          ...prev,
          receivingDate: "",
          rcBactchCode: "",
        }));
      }
    }}
    error={Boolean(formErrors?.invoiceDate)}         // ✅ safe access using optional chaining
    helperText={formErrors?.invoiceDate || ""}       // ✅ safe fallback
  />
);

export const RecevingTextFiled17 = ({ formData, setFormData, formErrors }) => (
  <TextField
    type="date"
    variant="outlined"
    label="Receiving Date"
    // className="invoice-input"

    value={formData.receivingDate ? formData.receivingDate.slice(0, 10) : ""}
    onChange={(e) => {
      const newReceivingDate = e.target.value;
      const date = new Date(newReceivingDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const rcBactchCode = `RcBatch-${day}-${month}-${year}`;
      setFormData((prev) => ({
        ...prev,
        receivingDate: newReceivingDate,
        rcBactchCode,
      }));

    }}
    error={Boolean(formErrors?.receivingDate)}         // ✅ safe access using optional chaining
    helperText={formErrors?.receivingDate || ""}       // ✅ safe fallback
    inputProps={{
      min: formData.invoiceDate ? formData.invoiceDate.slice(0, 10) : undefined
    }}
    InputLabelProps={{ shrink: true }}
  />
);