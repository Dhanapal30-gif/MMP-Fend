import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'
import ComTextFiled from '../Com_Component/ComTextFiled';


const TableMasterTextFiled = ({
    formData,
    handleChange,
    productandPartcode,
    formErrors
}) => {

    const productGroups = [...new Set(
        (productandPartcode || []).map(item => item.productgroup)
    )];

    const filteredProducts = (productandPartcode || []).filter(item =>
        (formData.productGroup || []).includes(item.productgroup)
    );

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <TextField
                    label="Table Name"
                    name="tableName"
                    value={formData.tableName}
                    onChange={(e) => handleChange("tableName", e.target.value)}
                    error={Boolean(formErrors?.tableName)}
                    helperText={formErrors?.tableName || ""}
                    multiline
                    minRows={1}

                />

                <Autocomplete
                    multiple
                    options={productGroups}
                    value={formData.productGroup || []}
                    getOptionLabel={(option) => option || ""}
                    onChange={(e, values) => {
                        handleChange("productGroup", values);
                        handleChange("productName", null);
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Product Group" size="small" />
                    )}

                />

                <Autocomplete
                    multiple
                    options={filteredProducts}
                    value={Array.isArray(formData.productName) ? formData.productName : []}
                    getOptionLabel={(o) => o?.productname || ""}
                    isOptionEqualToValue={(o, v) => o?.productname === v?.productname}
                    onChange={(e, values) => handleChange("productName", values)}
                    renderInput={(params) => (
                        <TextField {...params} label="Product Name" size="small" />
                    )}
                    error={Boolean(formErrors?.productname)}
                    helperText={formErrors?.productname || ""}
                />
            </ThemeProvider>
        </div>
    )
}

export default TableMasterTextFiled