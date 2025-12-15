import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";

const PutawayTextFiled = ({ formData, setFormData,isEditMode, isFrozen,isTicetFreze,
  ptldata,ptlPutawayTicketList, groupOptions, handleInputChange, nameOptions, serialOptions,
  partOptions, handleChange, productOptions, handlePoChange, formErrors }) => {


  const getOptionObj = (value, options) => {
    return options.find((opt) => opt.value === value) || null;
  };
  const BoardStaus = [
    { label: "Ongoing", value: "MSC00003" },
    { label: "Not Started", value: "MSC00001" },
    { label: "Closed", value: "MSC00004" },
    { label: "Cancel", value: "Cancel" },
  ];
  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        {/* // Assume PTLdata = [{ partcode, partdescription, racklocation, availableQuantity }, ...] */}

{!isTicetFreze && (
        <Autocomplete
          options={ptldata.map(item => ({
            label: item.partcode,
            value: item.partcode
          }))}
          getOptionLabel={(option) => option.label}
          value={getOptionObj(formData?.partcode, ptldata.map(item => ({ label: item.partcode, value: item.partcode })))}

          onChange={(e, newValue) => {
  const selectedPart = ptldata.find(item => item.partcode === newValue?.value);
  if (selectedPart) {
    setFormData(prev => ({
      ...prev,
      partcode: selectedPart.partcode,
      partdescription: selectedPart.partdescription,
      racklocation: selectedPart.racklocation,
      availableQuantity: selectedPart.availableQuantity,
      quantity:""
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      partcode: "",
      partdescription: "",
      racklocation: "",
      availableQuantity: "",
            quantity:""

    }));
  }
}} 

         renderInput={(params) => (
    <TextField
      {...params}
      label="Part Code"
      size="small"
      error={Boolean(formErrors?.partcode)}
      helperText={formErrors?.partcode || ""}
      disabled={isFrozen}
       className="disabledDarkText"

    />
  )}
  disabled={isFrozen}
/>
)}
{!isTicetFreze && (
        <ComTextFiled
          label="Part Description"
          name="partdescription"
          value={formData.partdescription || ''}
          onChange={handleInputChange}
          InputProps={{ readOnly: true }}

        />
)}
{!isTicetFreze && (
        <ComTextFiled
          label="Rack Location"
          name="racklocation"
          value={formData.racklocation || ''}
          onChange={handleInputChange}
          InputProps={{ readOnly: true }}

        />
)}
        {!isEditMode && !isTicetFreze && (
        <ComTextFiled
          label="Available Qty"
          name="availableQuantity"
          value={formData.availableQuantity || ''}
          onChange={handleInputChange}
          InputProps={{ readOnly: true }}

        />
)}

{!isTicetFreze && (
        <ComTextFiled
          label="Put Qty"
          name="quantity"
          value={formData.quantity || ''}
          onChange={handleInputChange}
          error={Boolean(formErrors?.quantity)}
          helperText={formErrors?.quantity || ""}
        />
)}

{isTicetFreze && (
    <div style={{ width: 390 }}> {/* width in px */}

<Autocomplete
  options={ptlPutawayTicketList.map(item => ({
    label: item.putawayTicket,
    value: item.putawayTicket
  }))}
  value={formData.ticketNumber || null} // example
  onChange={(e, newVal) => setFormData(prev => ({
    ...prev,
    ticket: newVal?.value || ""
  }))}
  renderInput={(params) => (
    <TextField {...params} label="Select Ticket"  size="small" />
  )}
  
/> </div>)}

      </ThemeProvider>
    </div>
  )
}

export default PutawayTextFiled