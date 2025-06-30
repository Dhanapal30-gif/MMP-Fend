import React, { useState } from 'react'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses, Select, FormControl, InputLabel } from '@mui/material';

function Add_Po_DetailUI({ formData, setFormData }) {

     const column = [
           {
               name: (
                   <div style={{ textAlign: "center" }}>
                       <label>Delete All</label>
                       <br />
                       <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === curencyMster.length && curencyMster.length > 0} />
                   </div>
               ),
               cell: (row) => (
                   <input type="checkbox" checked={selectedRows.includes(row.id)} onChange={() => handleRowSelect(row.id)} />
               ),
               width: "130px",
           },
           { name: "Edit", selector: row => (<button className="btn btn-warning btn-sm" onClick={() => handleEdit(row)}><FaEdit /></button>), width: "79px" },
           ,
           {
               name: "CurrencyName",
               selector: row => row.currencyname,
               sortable: true,
               width: `${calculateColumnWidth(curencyMster, 'CurrencyName')}px`
           },
           {
               name: "CurrencyValue",
               selector: row => row.currencyvalue,
               wrap: true,
               width: `${calculateColumnWidth(curencyMster, 'CurrencyValue')}px`
           },
           {
               name: "Effectivedate",
               selector: row => row.effectivedate,
               width: `${calculateColumnWidth(curencyMster, 'Effectivedate')}px`
           },
           {
               name: "modifieddate",
               selector: row => row.modifieddate,
               width: `${calculateColumnWidth(curencyMster, 'modifieddate')}px`
           }
       ]
    return (
        <div className='ComCssTexfiled'>
            
        </div>
    )
}

export default Add_Po_DetailUI