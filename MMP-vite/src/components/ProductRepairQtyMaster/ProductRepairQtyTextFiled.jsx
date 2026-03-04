import React from 'react'
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";


const ProductRepairQtyTextFiled = ({
    data,
    formData,
    setFormData,
    partcodeList,
    componentUsageList,
    handleInputChange,
    formErrors,
    handlePoChange,
    ponumberList,
    locationList,
    handleChange
}) => {
    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>

                <Autocomplete
                    options={data}
                    getOptionLabel={(option) => option.productName}
                    value={data.find(item => item.productName === formData.productname) || null}
                    onChange={(event, newValue) => {
                        if (newValue) {
                            setFormData({
                                ...formData,
                                productname: newValue.productName,
                                productgroup: newValue.productGroup,
                                productfamily: newValue.productFamily,

                            });
                        } else {
                            setFormData({ ...formData, productname: "", productgroup: "", productfamily: "" });
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Product Name"
                            variant="outlined"
                            // error={Boolean(formErrors.productname)}
                            // helperText={formErrors.productname}
                            size="small"
                        />
                    )}
                />
                <TextField
                    id="outlined-basic"
                    label="Product Group"
                    variant="outlined"
                    name="productgroup"
                    value={formData.productgroup}
                    className='ProductTexfiled-textfield '
                    onChange={handleChange}
                    size="small"
                />
                <TextField
                    id="outlined-basic"
                    label="Product Family"
                    variant="outlined"
                    name="productfamily"
                    value={formData.productfamily}
                    className='ProductTexfiled-textfield '
                    onChange={handleChange}
                    size="small"
                />

                {/* <TextField
                    label="Effective Date"
                    variant="outlined"
                    name="effectivedate"
                    value={formData.effectivedate}
                    InputProps={{ readOnly: true }}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    className='ProductTexfiled-textfield '
                /> */}

                 <TextField
    label="Effective Date"
    type="date"
    variant="outlined"
    name="effectivedate"
    value={formData.effectivedate || ""}
    onChange={(e) =>
        setFormData({ ...formData, effectivedate: e.target.value })
    }
    size="small"
    InputLabelProps={{ shrink: true }}
/>

                <ComTextFiled
                    label="Total RepairedQty"
                    name="totalRepairedQty"
                    type="number"
                    value={formData.comments || ""}
                    onChange={(e) => handleChange("comments", e.target.value)}
                    error={Boolean(formErrors?.comment)}
                    helperText={formErrors?.comments || ""}
                />
                <ComTextFiled
                    label="Repaired Ok"
                    name="repairedOk"
                    type="number"
                    value={formData.repairedOk || ""}
                    onChange={(e) => handleChange("repairedOk", e.target.value)}
                    error={Boolean(formErrors?.repairedOk)}
                    helperText={formErrors?.repairedOk || ""}
                />
                <ComTextFiled
                    label="Scrap"
                    name="scrap"
                    type="number"
                    value={formData.scrap || ""}
                    onChange={(e) => handleChange("scrap", e.target.value)}
                    error={Boolean(formErrors?.scrap)}
                    helperText={formErrors?.scrap || ""}
                />
            </ThemeProvider>
        </div >
    )
}

export default ProductRepairQtyTextFiled