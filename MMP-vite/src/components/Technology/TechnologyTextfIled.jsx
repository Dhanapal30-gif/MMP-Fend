import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from "@mui/material";
import DropdownCom from '../../components/Com_Component/DropdownCom'
import Popper from '@mui/material/Popper';

const TechnologyTextfIled = ({ formData, setFormData, isFrozen,
    typeOptions, ReworkerNameOptions, handleInputChange, nameOptions, serialOptions, localMasterPartcode,
    RepaierNameOptions, handleChange, productOptions, handlePoChange, formErrors }) => {
    const BoardStaus = [
        { label: "Ongoing", value: "MSC00003" },
        { label: "Not Started", value: "MSC00001" },
        { label: "Closed", value: "MSC00004" },
        { label: "Cancel", value: "Cancel" },
    ];
    const getOptionObj = (value, options) => {
        return options.find((opt) => opt.value === value) || null;
    }; const CustomPopper = (props) => (
        <Popper
            {...props}
            style={{
                ...props.style,
                width: '900px'
            }}
            placement="bottom-start"
        />
    );

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>

                <ComTextFiled
                    label="SUI Type"
                    name="sui"
                    value={formData.sui}
                    onChange={handlePoChange}
                    error={Boolean(formErrors?.sui)}
                    helperText={formErrors?.sui || ""}
                    disabled={isFrozen}

                />
                <Autocomplete
                    options={localMasterPartcode}
                    getOptionLabel={(option) => option?.partcode || ""}
                    isOptionEqualToValue={(option, value) => option.partcode === value.partcode}
                    value={localMasterPartcode.find(item => item.partcode === formData.partcode) || null}
                    ListboxComponent={DropdownCom}
                    onChange={(event, newValue) => {
                        if (newValue) {
                            setFormData({
                                ...formData,
                                partcode: newValue.partcode,
                                partdescription: newValue.partdescription,
                                rackLocation: newValue.rackLocation,
                                availbleQty: newValue.availbleQty
                            });
                        } else {
                            setFormData({ ...formData, partcode: "", partdescription: "" });
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Partcode"
                            variant="outlined"
                            error={Boolean(formErrors.partcode)}
                            helperText={formErrors.partcode}
                            size="small"
                        />
                    )}
                />

                <Autocomplete
                    options={localMasterPartcode}
                    // ListboxComponent={localMasterPartcode}
                    PopperComponent={CustomPopper}
                    getOptionLabel={(option) => option?.partdescription || ""}
                    isOptionEqualToValue={(option, value) => option.partdescription === value.partdescription}
                    value={localMasterPartcode.find(item => item.partdescription === formData.partdescription) || null}
                    onChange={(event, newValue) => {
                        if (newValue) {
                            setFormData({
                                ...formData,
                                partcode: newValue.partcode,
                                partdescription: newValue.partdescription,
                                rackLocation: newValue.rackLocation,
                                availbleQty: newValue.availbleQty
                            });
                        } else {
                            setFormData({ ...formData, partcode: "", partdescription: "" });
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Partdescription"
                            variant="outlined"
                            error={Boolean(formErrors.partdescription)}
                            helperText={formErrors.partdescription}
                            size="small"
                        />
                    )}
                />


                <ComTextFiled
                    label="RackLocation"
                    name="RackLocation"
                    // value={formData.rackLocation}

                    value={localMasterPartcode.find(item => item.partcode === formData.partcode)?.rackLocation || ""}

                />
                <ComTextFiled
                    label="Availablity Qty"
                    name="availablityQty"
                    value={localMasterPartcode.find(item => item.availbleQty === formData.availbleQty)?.availbleQty || ""}

                />
                <ComTextFiled
                    label="Req Qty"
                    name="req_qty"
                    value={formData.req_qty}
                    onChange={handleInputChange}
                    error={Boolean(formErrors?.req_qty)}
                    helperText={formErrors?.req_qty || ""}
                />




            </ThemeProvider>
        </div>
    )


}
export default TechnologyTextfIled