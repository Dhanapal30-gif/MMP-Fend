import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled'; // adjust path if needed
import TextFiledTheme from '../Com_Component/TextFiledTheme'; // adjust path if needed

const PTLTextfiled = ({ formData, handleChange, formErrors }) => {
  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <ComTextFiled
          label="Partcode"
          name="partcode"
          value={formData.partcode}
          onChange={handleChange}
          error={Boolean(formErrors?.Partcode)}
          helperText={formErrors?.Partcode || ""}
        />
        <ComTextFiled
          label="PartDescription"
          name="partdescription"
          value={formData.partdescription}
          onChange={handleChange}
          
        />
        <ComTextFiled
          label="ROHS Status"
          name="rohsstatus"
          value={formData.rohsstatus}
          onChange={handleChange}
         
        />
        <ComTextFiled
          label="MSD Status"
          name="msdstatus"
          value={formData.msdstatus}
          onChange={handleChange}
         
        />
        <ComTextFiled
          label="Technology"
          name="technology"
          value={formData.technology}
          onChange={handleChange}
        
        />
        <ComTextFiled
          label="Rack Location"
          name="racklocation"
          value={formData.racklocation}
          onChange={handleChange}
          
        />
        <ComTextFiled
          label="Quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
         
        />
        <ComTextFiled
          label="Unit Price"
          name="unitprice"
          value={formData.unitprice}
          onChange={handleChange}
          
        />
        <ComTextFiled
          label="Customs Duty"
          name="customduty"
          value={formData.customduty}
          onChange={handleChange}
          
        />
        <ComTextFiled
          label="CAT  Movement"
          name="catmovement"
          value={formData.catmovement}
          onChange={handleChange}
          
        />
       
        <ComTextFiled
          label="MOQ"
          name="MOQ"
          value={formData.MOQ}
          onChange={handleChange}
          
        />
        <ComTextFiled
          label="Threshold Request Qty "
          name="TRQty"
          value={formData.TRQty}
          onChange={handleChange}
          
        />
      </ThemeProvider>
    </div>
  );
};

export default PTLTextfiled;
