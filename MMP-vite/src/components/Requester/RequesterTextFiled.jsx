import React from 'react';
import { Autocomplete, TextField } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import DropdownCom from '../../components/Com_Component/DropdownCom'
import ComTextFiled from '../Com_Component/ComTextFiled';

const RequesterTextFiled = ({
    formData,
    handleChange,
    poDropdownOptions,
    orderTypeOption,
    requestType,
    requesterType,
    userId,
    requestTypeOption,
    productandPartcode,
    compatibilityData,
    formErrors,
    isFrozen
}) => {

    const requesterForOption = [
        { label: "Material Request", value: "Material Request" },
        { label: "P2P Transfer Request", value: "P2P Transfer Request" },
        { label: "Scrap Request", value: "Scrap Request" },
        { label: "Material Project Request", value: "Material Project Request" },
        { label: "Material Request Project", value: "Material Request Project" }
    ];

    const uniqueProducts = Array.from(
        new Map((productandPartcode || []).map(item => [item.productname, item])).values()
    );
    const availbleqty = compatibilityData?.[0]?.Availbleqty ?? "0";

    const compatability = (compatibilityData || [])
        .filter(item => item.compatabilityPartcode) // remove undefined
        .map(item => ({
            compatibilityPartCode: item.compatabilityPartcode,
            compatibilityAvailableQty: item.compatabilityQty
        }));
    console.log("compatabilitylength", compatability.length);

    console.log("compatability", compatability);
    // const filteredPartCodes = Array.from(
    //   new Map((productandPartcode || []).map(item => [item.partcode, item])).values()
    // );

    // const filteredPartCodes = React.useMemo(() => {
    //     if (!formData.productName || !Array.isArray(productandPartcode)) return [];
    //     const selectedName = formData.productName.productname?.trim().toLowerCase();
    //     return productandPartcode
    //         .filter(item => item.productname?.trim().toLowerCase() === selectedName)
    //         .map(item => item.partcode);
    // }, [formData.productName, productandPartcode]);

    // Filter part options based on selected product
    // Filter parts based on selected product
    const filteredParts = React.useMemo(() => {
        if (!formData.productName || !Array.isArray(productandPartcode)) return [];
        const selectedProduct = formData.productName.productname?.trim().toLowerCase();
        return productandPartcode
            .filter(item => item.productname?.trim().toLowerCase() === selectedProduct)
            .map(item => ({
                partcode: item.partcode,
                partdescription: item.partdescription,
                productname: item.productname
            }));
    }, [formData.productName, productandPartcode]);


    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                {/* <Autocomplete
                    options={requesterForOption}
                    getOptionLabel={(option) => option.label}
                    //   value={getOptionObj(formData.year, yearOptions)}
                    //   onChange={(e, newValue) => handleChange("year", newValue?.value || "")}
                    renderInput={(params) => (
                        <TextField {...params} label="Request Ticket No" variant="outlined" sx={{
                            borderRadius: "8px"
                        }}
                            InputProps={{ readOnly: true }}
                            InputLabelProps={{ shrink: true }} />
                    )}
                /> */}
                <Autocomplete
                    options={userId.toLowerCase() === "admin" ? requesterForOption : requesterType} // ternary
                    readOnly={isFrozen}
                    value={formData.requestFor || null} // null if empty
                    getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                    }
                    onChange={(e, newValue) => handleChange("requestFor", newValue)}
                    renderInput={(params) => (
                        <TextField {...params}
                            error={Boolean(formErrors?.requestFor)}
                            helperText={formErrors?.requestFor || ""}
                            label="Request For" variant="outlined" size="small" />
                    )}
                />

{(formData.requestFor?.value || formData.requestFor) !== "Material Request" ? (
                    <Autocomplete
                        options={orderTypeOption}
                        readOnly={isFrozen}
                        value={
                            formData.orderType
                                ? { label: formData.orderType, value: formData.orderType }
                                : null
                        }
                        getOptionLabel={(option) => option.label}
                        onChange={(e, newValue) => handleChange("orderType", newValue ? newValue.value : "")}
                        renderInput={(params) => (
                            <TextField {...params}
                                error={Boolean(formErrors?.orderType)}
                                helperText={formErrors?.orderType || ""}
                                label="Order Type" variant="outlined" size="small" />
                        )}
                    />

                ) : (
                    <TextField
                        label="Order Type"
                        value="Repair"
                        variant="outlined"
                        size="small"
                        disabled
                        fullWidth
                    />
                )}

                <Autocomplete
                    options={userId.toLowerCase() === "admin" ? requestTypeOption : requestType} // ternary
                    readOnly={isFrozen}

                    // options={requestType || []}
                    value={formData.requesterType || null}
                    // getOptionLabel={(option) => option || ""}
                    getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.label
                    }
                    isOptionEqualToValue={(option, value) => option === value}
                    onChange={(e, newValue) => handleChange("requesterType", newValue || "")}
                    renderInput={(params) => (
                        <TextField {...params} label="Requester Type"
                            error={Boolean(formErrors?.requesterType)}
                            helperText={formErrors?.requesterType || ""}
                            variant="outlined" size="small" />
                    )}
                />

                <Autocomplete
                    options={uniqueProducts}
                    value={formData.productName || null}
                    getOptionLabel={(option) => option.productname || ""}
                    isOptionEqualToValue={(option, value) => option.productname === value.productname}
                    onChange={(e, newValue) => handleChange("productName", newValue || null)}
                    readOnly={isFrozen} // make readonly instead of disabled
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            error={Boolean(formErrors?.productName)}
                            helperText={formErrors?.productName || ""}
                            label="Product Name"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                ...params.InputProps,
                                readOnly: isFrozen,
                                style: { color: "#000" } // dark letters
                            }}
                        />
                    )}
                />

                {/* 
    {isFrozen ? (
  <TextField
    label="Product Name"
    variant="outlined"
    size="small"
    fullWidth
    value={formData.productName?.productname || formData.productName || ""}
    InputProps={{ readOnly: true }}
  />
) : (
  <Autocomplete
    options={uniqueProducts}
    value={formData.productName || null}
    getOptionLabel={(option) =>
      typeof option === "string" ? option : option.productname || ""
    }
    isOptionEqualToValue={(option, value) =>
      option.productname === value?.productname
    }
    onChange={(e, newValue) => handleChange("productName", newValue || null)}
    renderInput={(params) => (
      <TextField
        {...params}
        error={Boolean(formErrors?.productName)}
        helperText={formErrors?.productName || ""}
        label="Product Name"
        variant="outlined"
        size="small"
      />
    )}
  />
)}
*/}

                <TextField
                    label="Product Group"
                    name="productGroup"
                    value={formData.productGroup || ""}
                    InputProps={{
                        readOnly: true,
                        style: { color: "#000" }
                    }}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                />


                <TextField
                    label="Product Family"
                    name="productFamily"
                    value={formData.productFamily || ""}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                />
                <Autocomplete
                    options={filteredParts}
                    value={formData.partCode || null} // must be object
                    getOptionLabel={(option) => option.partcode || ""}
                    isOptionEqualToValue={(option, value) => option?.partcode === value?.partcode}
                    onChange={(e, newValue) => handleChange("partCode", newValue || null)}
                    renderInput={(params) => <TextField {...params}
                        error={Boolean(formErrors?.partCode)}
                        helperText={formErrors?.partCode || ""}
                        label="Part Code" size="small" />}
                />

                <Autocomplete
                    options={filteredParts}
                    value={formData.partCode || null} // same object
                    getOptionLabel={(option) => option.partdescription || ""}
                    isOptionEqualToValue={(option, value) => option?.partdescription === value?.partdescription}
                    onChange={(e, newValue) => handleChange("partCode", newValue || null)}
                    renderInput={(params) => <TextField {...params}
                        error={Boolean(formErrors?.partDescription)}
                        helperText={formErrors?.partDescription || ""}
                        label="Part Description" size="small" />}
                />



                <ComTextFiled
                    label="UOM"
                    name="uom"
                    value={formData.uom || ""}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                />

                <ComTextFiled
                    label="Type Of Component"
                    name="typeOfComponent"
                    value={formData.typeOfComponent || ""}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                />

                <ComTextFiled
                    label="Component Usage"
                    name="componentUsage"
                    value={formData.componentUsage || ""}
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                />


                <ComTextFiled
                    label="Request Qty"
                    name="requestQty"
                    value={formData.requestQty || ""}
                    type="number"
                    onChange={(e) => handleChange("requestQty", e.target.value)}
                    error={Boolean(formErrors?.requestQty)}
                    helperText={formErrors?.requestQty || ""}
                />
                <ComTextFiled
                    label="Available Qty"
                    name="availableQty"
                    // show only if value exists
                    value={formData.availableQty || availbleqty}
                    onChange={(e) => handleChange("availableQty", e.target.value)}
                />

                {compatability.length > 0 && (
                    <Autocomplete
                        options={compatability}
                        value={compatability.find(
                            item => item.compatibilityPartCode === formData.compatibilityPartCode
                        ) || null}
                        getOptionLabel={(option) => option.compatibilityPartCode || ""}
                        isOptionEqualToValue={(option, value) => option?.compatibilityPartCode === value?.compatibilityPartCode}
                        onChange={(e, newValue) => {
                            handleChange("compatibilityPartCode", newValue?.compatibilityPartCode || "");
                            handleChange("compatibilityAvailableQty", newValue?.compatibilityAvailableQty || "");
                        }}
                        renderInput={(params) => <TextField {...params}
                            error={Boolean(formErrors?.compatibilityPartCode)}
                            helperText={formErrors?.compatibilityPartCode || ""}
                            label="Compatibility PartCode" size="small" />}
                    />

                )}
                {compatability.length >= 1 && (

                    <ComTextFiled
                        label="Compatibility - Available Qty"
                        name="compatibilityAvailableQty"
                        value={formData.compatibilityAvailableQty || ""}
                        onChange={(e) => handleChange("compatibilityAvailableQty", e.target.value)}
                        InputProps={{ readOnly: true }}

                    />
                )}

                {formData.requesterType === "Submodule" && (
                    <ComTextFiled
                        label="Faulty Serial Number"
                        name="faultySerialNumber"
                        value={formData.faultySerialNumber || ""}
                        onChange={(e) => handleChange("faultySerialNumber", e.target.value)}
                        error={Boolean(formErrors?.faultySerialNumber)}
                        helperText={formErrors?.faultySerialNumber || ""}
                    />
                )}

                {formData.requesterType === "Submodule" && (

                    <ComTextFiled
                        label="Faulty Unit Module Serial No"
                        name="faultyUnitModuleSerialNo"
                        value={formData.faultyUnitModuleSerialNo || ""}
                        onChange={(e) => handleChange("faultyUnitModuleSerialNo", e.target.value)}
                        error={Boolean(formErrors?.faultyUnitModuleSerialNo)}
                        helperText={formErrors?.faultyUnitModuleSerialNo || ""}
                    />
                )}

                <TextField
                    label="Comments"
                    name="requestercomments"
                    value={formData.requestercomments}
                    onChange={(e) => handleChange("requestercomments", e.target.value)}
                    error={Boolean(formErrors?.requestercomments)}
                    helperText={formErrors?.requestercomments || ""}
                    multiline
                    minRows={1}
                />
            </ThemeProvider>
        </div>
    )

}

export default RequesterTextFiled;
