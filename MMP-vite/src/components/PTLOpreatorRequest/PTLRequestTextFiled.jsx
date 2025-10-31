import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'
import ComTextFiled from '../Com_Component/ComTextFiled'; // adjust path if needed
import Popper from '@mui/material/Popper';
const PTLRequestTextFiled = ({
    formData,
    handleChange,
    poDropdownOptions,
    onSelectPonumber,
    setFormData,
    returningOptions,
    handlePutawayChange,
    transferTicketNoList,
    formErrors,
    rcMainStore,

}) => {
    const CustomPopper = (props) => (
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
                <Autocomplete
                    options={rcMainStore}
                    getOptionLabel={(option) => option?.partcode || ""}
                    isOptionEqualToValue={(option, value) => option.partcode === value.partcode}
                    value={rcMainStore.find(item => item.partcode === formData.partcode) || null}
                    ListboxComponent={DropdownCom}
                    onChange={(event, newValue) => {
                        if (newValue) {
                                    console.log("Selected AvailableQty:", newValue.available_Qty);

                            setFormData({
                                ...formData,
                                partcode: newValue.partcode,
                                partdescription: newValue.partdescription,
                                 availableQty: Number(newValue.available_Qty ?? 0), // camelCase
                                requestQty: "",
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
                            error={Boolean(formErrors?.partcode)}
                            helperText={formErrors?.partcode}
                            size="small"
                        />
                    )}
                />
                <Autocomplete
                    options={rcMainStore}
                    ListboxComponent={DropdownCom}
                    PopperComponent={CustomPopper}
                    getOptionLabel={(option) => option?.partdescription || ""}
                    isOptionEqualToValue={(option, value) => option.partdescription === value.partdescription}
                    value={rcMainStore.find(item => item.partdescription === formData.partdescription) || null}
                    onChange={(event, newValue) => {
                        if (newValue) {
                            setFormData({
                                ...formData,
                                partcode: newValue.partcode,
                                partdescription: newValue.partdescription,
                                availableQty: Number(newValue.available_Qty ?? 0), // camelCase
                                requestQty: "",

                            });
                        } else {
                            setFormData({ ...formData, partcode: "", partdescription: "" });
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="part Description"
                            variant="outlined"
                            //   error={Boolean(formErrors.partdescription)}
                            //   helperText={formErrors.partdescription}
                            size="small"
                        />
                    )}
                />
                <ComTextFiled
                    label="Request Quantity"
                    name="requestQty"
                    type="number"
                    value={formData.requestQty}
                    onChange={handleChange}
                    error={formErrors?.requestQty}
                    helperText={formErrors?.requestQty || ""}
                />
            </ThemeProvider>
        </div>
    )
}
export default PTLRequestTextFiled