import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom';
import ComTextFiled from "../../components/Com_Component/ComTextFiled";

const StockTransferTextFile = ({
    formData,
    handleChange,
    trnasferPrtcode,
    formErrors,
    inventory_box_no
}) => {
    const statusOptions = [
        { label: "Open", value: "Open" },
        { label: "Close", value: "Close" },
        { label: "Manual Close", value: "Manual Close" },
        { label: "Canceled", value: "Canceled" },
        { label: "On Hold", value: "On Hold" }
    ];
    const TransferTypeOption = [
        { label: "Internal Transfer", value: "Internal Transfer" },
        { label: "RC-DHL", value: "RC-DHL" },
        { label: "DHL-RC", value: "DHL-RC" },

    ];
    const OrderTypeOption = [
        { label: "Repair", value: "Repair" },
        { label: "Project", value: "Project" },

    ];

    const transferPartcodeOptions = React.useMemo(() =>
        trnasferPrtcode.map(item => ({
            label: item.partcode,
            value: item.partcode
        })),
        [trnasferPrtcode]
    );

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <Autocomplete
                    options={TransferTypeOption}
                    getOptionLabel={(option) => option.label}
                    value={TransferTypeOption.find(opt => opt.value === formData.transfertype) || null}
                    onChange={(e, newValue) => handleChange("transfertype", newValue?.value || "")}
                    renderInput={(params) => (
                        <TextField {...params} label="Transfer Type"
                            error={Boolean(formErrors?.transfertype)}
                            helperText={formErrors?.transfertype || ""}

                            variant="outlined" size="small" sx={{
                                borderRadius: "8px"
                            }} />
                    )}
                />
                <Autocomplete
                    options={OrderTypeOption}
                    getOptionLabel={(option) => option.label}
                    value={OrderTypeOption.find(opt => opt.value === formData.ordertype) || null}
                    onChange={(e, newValue) => handleChange("ordertype", newValue?.value || "")}
                    renderInput={(params) => (
                        <TextField {...params} label="ordertype"
                            error={Boolean(formErrors?.ordertype)}
                            helperText={formErrors?.ordertype || ""}

                            variant="outlined" size="small" sx={{
                                borderRadius: "8px"
                            }} />
                    )}
                />
                {/* <ComTextFiled
                    ListboxComponent={DropdownCom}
                    label="Partcode"
                    name="partcode"
                    isAutocomplete
                    options={transferPartcodeOptions}
                    getOptionLabel={(option) => option.label}
                    value={transferPartcodeOptions.find(opt => opt.value === formData.partcode) || null} // full object
                    onAutoChange={(newValue) => handleChange("partcode", newValue?.value || "")} // store string
                /> */}

                <Autocomplete
                    options={transferPartcodeOptions}
                    getOptionLabel={(option) => option.label}
                    value={transferPartcodeOptions.find(opt => opt.value === formData.partcode) || null}
                    onChange={(e, newValue) => handleChange("partcode", newValue?.value || "")}
                    renderInput={(params) => (
                        <TextField {...params} label="Partcode"
                            error={Boolean(formErrors?.partcode)}
                            helperText={formErrors?.partcode || ""}

                            variant="outlined" size="small" sx={{
                                borderRadius: "8px"
                            }} />
                    )}
                />
                {(formData.transfertype === 'RC-DHL') && (
                    <ComTextFiled
                        label="Trnasfer Qty"
                        name="transferqty"
                        value={formData.transferqty || ""}
                        type="number"
                        onChange={(e) => handleChange("transferqty", e.target.value)}
                        error={Boolean(formErrors?.transferqty)}
                        helperText={formErrors?.transferqty || ""}
                    />
                )}
                {(formData.transfertype === 'RC-DHL') && (

                    <ComTextFiled
                        label="Inventory box number"
                        name="iventooryBoxNumber"
                        value={inventory_box_no || ""}
                        onChange={(e) => setBoxNumber(e.target.value)}
                    />

                )}

                {(formData.transfertype === 'RC-DHL') && (
                    <ComTextFiled
                        label="Comment"
                        name="comments"
                        value={formData.comments || ""}
                        onChange={(e) => handleChange("comments", e.target.value)}
                        error={Boolean(formErrors?.comment)}
                        helperText={formErrors?.comments || ""}
                    />
                )}
            </ThemeProvider>
        </div>
    )
}

export default StockTransferTextFile