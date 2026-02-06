import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled'; // adjust path if needed
import TextFiledTheme from '../Com_Component/TextFiledTheme'; // adjust path if needed
import { Autocomplete, TextField } from "@mui/material";
import { fetchSearchSuiNo } from '../../Services/Services-Rc';

const RepaierTextfile = ({ formData, setSuiData, setFormErrors, extraFields, setExtraFields, setFormData, isFrozen, partOptions, suiNoOptions, handleChange, productOptions, handlePoChange, setTableData, setShowTable, formErrors }) => {
    const RepaierType = [
        { label: "SUI", value: "SUI" },
        { label: "Rework", value: "Rework" },
        { label: "RND", value: "RND" },
        { label: "Soldring", value: "Soldring" },
        { label: "Desoldring", value: "Desoldring" },
        { label: "Track change", value: "Trackchange" },
        { label: "Reflow", value: "Reflow" },
        { label: "BGA", value: "BGA" },
        { label: "Swap", value: "Swap" },
        { label: "Thermal GEL", value: "Thermal GEL" }
    ];
    const getOptionObj = (value, options) => {
        return options.find((opt) => opt.value === value) || null;
    };

    const handleSearchSuiNo = (sui) => {
        if (!formData.boardserialnumber?.trim() || formData.boardserialnumber.length !== 11) {
            setFormErrors({
                boardserialnumber: !formData.boardserialnumber?.trim()
                    ? "Enter Module Serial Number"
                    : "Module Serial Number must be exactly 11 characters"
            });
            setShowTable(false);
            setFormData({...formData, SUINo: ""})
            return;
        }
         if (!formData.productname) {
    setFormErrors({
      productname: "Please Enter Product Name"
    });
    setShowTable(false);
     setFormData({...formData, SUINo: ""})
    return;
  }


        fetchSearchSuiNo(sui)
            .then((res) => {
                // Merge each response row with current formData fields
                const mergedRows = res.data.table1.map(row => ({
                    ...formData,  // productname, productfamily, productgroup, etc.
                    ...row        // partcode, quantity, etc.
                }));

                setTableData(mergedRows);
                setSuiData(res.data);
                setShowTable(true);
            })
            .catch(err => console.error(err));
    };


    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                {/* <ComTextFiled
                    label="productname"
                    name="productname"
                    value={formData.productname}
                    onChange={handleChange}
                    error={Boolean(formErrors?.productname)}
                    helperText={formErrors?.productname || ""}
                /> */}
                <Autocomplete
                    options={productOptions}
                    disabled={isFrozen}

                    getOptionLabel={(option) => option.label || ""}
                    value={productOptions.find(opt => opt.value === formData.productname) || null}
                    onChange={(e, newValue) => {
                        setFormData(prev => ({
                            ...prev,
                            productname: newValue?.value || "",
                            // productGroup: newValue?.productgroup || "",
                            // productFamily: newValue?.productfamily || ""
                        }));
                        setExtraFields({
                            productGroup: newValue?.productgroup || "",
                            productFamily: newValue?.productfamily || ""
                        });
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Product Name"
                            className="comTextFiled"
                            variant="outlined" size="small"
                            error={Boolean(formErrors?.productname)}
                            helperText={formErrors?.productname || ""}
                        />
                    )}
                />

                <ComTextFiled
                    label="Product Group"
                    className="comTextFiled"
                    name="productGroup"
                    InputLabelProps={{ shrink: true }}
                    value={extraFields.productGroup}
                    InputProps={{ readOnly: true }}

                />

                <ComTextFiled
                    InputLabelProps={{ shrink: true }}
                    className="comTextFiled"
                    label="Product Family"
                    name="productFamily"
                    value={extraFields.productFamily}
                    InputProps={{ readOnly: true }}
                />


                {/* <ComTextFiled
                    label="Module Serial Number"
                    name="boardserialnumber"
                    value={formData.boardserialnumber}
                    onChange={handleChange}
                      disabled={isFrozen}
                    error={Boolean(formErrors?.boardserialnumber)}
                    helperText={formErrors?.boardserialnumber || ""}
                /> */}
                <ComTextFiled
                    label="Module Serial Number"
                    name="boardserialnumber"
                    value={formData.boardserialnumber}
                    onChange={handleChange}
                    disabled={isFrozen}
                    error={Boolean(formErrors?.boardserialnumber)}
                    helperText={formErrors?.boardserialnumber || ""}
                    className="comTextFiled"
                // inputProps={{ maxLength: 11 }}

                />
<ComTextFiled
                    label="Component Location"
                    name="repairelocation"
                    value={formData.repairelocation}
                    onChange={handleChange}
                    // disabled={isFrozen}
                    error={Boolean(formErrors?.repairelocation)}
                    helperText={formErrors?.repairelocation || ""}
                    className="comTextFiled"
                // inputProps={{ maxLength: 11 }}

                />
                <Autocomplete

                    options={RepaierType}
                    getOptionLabel={(option) => option.label}
                    value={getOptionObj(formData.type, RepaierType)}
                    onChange={(e, newValue) => handlePoChange("type", newValue?.value || "")}
                    disabled={isFrozen}
                    renderInput={(params) => (

                        <TextField {...params} label="Reworker Type"
                            className="comTextFiled"
                            error={Boolean(formErrors?.type)}
                            helperText={formErrors?.type || ""}
                            variant="outlined" size="small" />

                    )}
                />

                {(formData.type === "Rework" || formData.type === "RND" || formData.type === "BGA") && (
                    <>

                        {/* <Autocomplete
                            options={partOptions}
                            // value={formData.partcode || null}  // store full object
                            value={partOptions.find(opt => opt.value === formData.partcode) || null}
                            getOptionLabel={(option) => option.label || ""}
                            // isOptionEqualToValue={(option, value) => option?.value === value?.value}
                            onChange={(e, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    partcode: newValue?.value || "",
                                    partdescription: newValue?.partdescription || "",
                                    racklocation: newValue?.racklocation || "",
                                    availableqty: newValue?.availableqty || ""
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    className="comTextFiled"
                                    label="Partcode"
                                    variant="outlined"
                                    size="small"
                                    error={Boolean(formErrors?.partcode)}
                                    helperText={formErrors?.partcode || ""}
                                />
                            )}
                        /> */}
                        {/* <Autocomplete
                            options={partOptions}
                            value={partOptions.find(opt => opt.value === formData.partcode) || null}
                            getOptionLabel={(option) => option.label || ""}

                            onChange={(e, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    partcode: newValue?.value || "",
                                    partdescription: newValue?.partdescription || "",
                                    racklocation: newValue?.racklocation || "",
                                    availableqty: newValue?.availableqty || "",
                                    pickingqty: newValue?.pickingqty || ""
                                }));
                            }}

                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                //    className="comTextFiled"
                                    label="Partcode"
                                  //  variant="outlined"
                                    size="small"
                                />
                            )}
                        /> */}
                        {/* <Autocomplete
    options={Array.isArray(partOptions) ? partOptions : []}
    value={formData.partcode || null}
    getOptionLabel={(o) => o?.partcode || ""}
    isOptionEqualToValue={(o, v) => o?.partcode === v?.partcode}
    onChange={(e, newValue) => {
        setFormData(prev => ({
            ...prev,
            partcode: newValue || null,
            partdescription: newValue?.partdescription || "",
            racklocation: newValue?.racklocation || "",
            availableqty: newValue?.quantity || ""
        }));
    }}
    renderInput={(params) => (
        <TextField {...params} label="Partcode" size="small" />
    )}
/> */}

<Autocomplete
    options={Array.isArray(partOptions) ? partOptions : []}
    value={partOptions.find(o => o.partcode === formData.partcode) || null}
    getOptionLabel={(o) => o?.partcode || ""}
    isOptionEqualToValue={(o, v) => o?.partcode === v?.partcode}
    onChange={(e, newValue) => {
        setFormData(prev => ({
            ...prev,
            partcode: newValue?.partcode || "",
            partdescription: newValue?.partdescription || "",
            racklocation: newValue?.racklocation || "",
            availableqty: newValue?.quantity || ""
        }));
    }}
    renderInput={(params) => (
        <TextField {...params} label="Partcode" size="small" />
    )}
/>

                        <ComTextFiled
                            label="partdescription"
                            name="partdescription"
                            value={formData.partdescription}
                            onChange={handleChange}
                            className="comTextFiled"
                        // error={Boolean(formErrors?.partdescription)}
                        // helperText={formErrors?.partdescription || ""}
                        />

                        <ComTextFiled
                            label="Racklocation"
                            name="racklocation"
                            value={formData.racklocation}
                            InputProps={{ readOnly: true }}
                            className="comTextFiled"
                        />

                        <ComTextFiled
                            label="Availableqty"
                            name="availableqty"
                            value={formData.availableqty}
                            InputProps={{ readOnly: true }}
                            className="comTextFiled"
                        />

                        <ComTextFiled
                            label="Pickingqty"
                            className="comTextFiled"
                            type="number"
                            name="pickingqty"
                            value={formData.pickingqty}
                            onChange={handleChange}
                            error={Boolean(formErrors?.pickingqty)}
                            helperText={formErrors?.pickingqty || ""}
                        />
                    </>
                )}

                {formData.type === "SUI" && (
                    // <>
                    //     <ComTextFiled
                    //         label="SUI No"
                    //         name="SUINo"
                    //         value={extraFields.SUINo}
                    //         onChange={(e) =>
                    //             setExtraFields(prev => ({
                    //                 ...prev,
                    //                 SUINo: e.target.value
                    //             }))
                    //         }
                    //         // error={formErrors?.SUINo}
                    //         // helperText={formErrors?.SUINo || ""}
                    //     />

                    // </>
                    <Autocomplete
                        options={suiNoOptions}
                        getOptionLabel={(option) => option.label || ""}
                        value={suiNoOptions.find(opt => opt.value === formData.SUINo) || null}
                        onChange={(e, newValue) => {
                            const sui = newValue?.value || "";
                            setFormData(prev => ({ ...prev, SUINo: sui }));
                            if (sui) handleSearchSuiNo(sui); // ✅ trigger directly
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="SUINo"
                                className="comTextFiled"
                                variant="outlined"
                                size="small"
                                error={Boolean(formErrors?.SUINo)}
                                helperText={formErrors?.SUINo || ""}
                            />
                        )}
                    />
                )}
                {formData.type === "Thermal GEL" && (
                    <>
                        <ComTextFiled
                            label="Quantity"
                            className="comTextFiled"
                            name="tgquantity"
                            value={formData.tgquantity}
                            onChange={handleChange}
                            error={formErrors?.tgquantity}
                            helperText={formErrors?.tgquantity || ""}
                        />
                    </>
                )}
                {(formData.type === "Rework" || formData.type === "RND" || formData.type === "Soldring" || formData.type === "Desoldring"
                    || formData.type === "Trackchange" || formData.type === "Reflow" || formData.type === "BGA" || formData.type === "Thermal GEL" || formData.type === "Swap") && (
                        <>
                            <TextField
                                label="Comments"
                                className="comTextFiled"
                                name="repairercomments"
                                value={formData.repairercomments}
                                onChange={handleChange}
                                error={Boolean(formErrors?.repairercomments)}
                                helperText={formErrors?.repairercomments || ""}
                                multiline
                                minRows={1}
                            />
                        </>
                    )}
                    
            </ThemeProvider>
        </div>
    )
}

export default RepaierTextfile