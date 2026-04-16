// import React from 'react'
// import { ThemeProvider } from '@mui/material/styles';
// import ComTextFiled from '../Com_Component/ComTextFiled';
// import TextFiledTheme from '../Com_Component/TextFiledTheme';
// import { InputAdornment, IconButton } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import { Autocomplete, TextField } from "@mui/material";


// const IssuanceTATReportTextFiled = ({
//   formData,
//   setFormData,
//   productDetail,
//   componentUsage,
//   handleInputChange,
//   formErrors,
//   handlePoChange,
//   ponumberList
// }) => {

//   const getDateRange = (label) => {
//     const endDate = new Date();
//     const startDate = new Date();

//     switch (label) {
//       case "Last 1 Month":
//         startDate.setMonth(startDate.getMonth() - 1);
//         break;
//       case "Last 3 Month":
//         startDate.setMonth(startDate.getMonth() - 3);
//         break;
//       case "Last 6 Month":
//         startDate.setMonth(startDate.getMonth() - 6);
//         break;
//       case "Last Year ":
//         startDate.setMonth(startDate.getMonth() - 12);
//         break;
//       default:
//         return null;
//     }

//     const format = (date) => date.toISOString().split('T')[0];

//     return {
//       startDate: format(startDate),
//       endDate: format(endDate)
//     };
//   };

//   const download = [
//     "Last 1 Month",
//     "Last 3 Month",
//     "Last 6 Month",
//     "Last Year "

//   ].map(label => ({
//     label,
//     value: getDateRange(label)
//   }));
//   const getDownloadValue = () => {
//     if (!formData.download || typeof formData.download !== "object") return null;

//     return download.find((opt) =>
//       JSON.stringify(opt.value) === JSON.stringify(formData.download)
//     ) || null;
//   };

//   return (
//     <div className="ComCssTexfiled">
//       <ThemeProvider theme={TextFiledTheme}>

//         {/* <Autocomplete
//           options={productDetail}
//           getOptionLabel={(option) => option[0] || ""}
//           value={
//             productDetail.find(
//               (item) => item[0] === formData.productname
//             ) || null
//           }
//           onChange={(event, newValue) => {
//             if (newValue) {
//               setFormData((prev) => ({
//                 ...prev,   // ✅ KEEP existing values
//                 productname: newValue[0],
//                 productgroup: newValue[1],
//                 productfamily: newValue[2]
//               }));
//             } else {
//               setFormData((prev) => ({
//                 ...prev,
//                 productname: "",
//                 productgroup: "",
//                 productfamily: ""
//               }));
//             }
//           }}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label="Product Name"
//               size="small"
//               fullWidth
//             />

//           )}
//         /> */}

//          <Autocomplete
//           options={productDetail}
//           getOptionLabel={(option) => option[1] || ""}
//           value={
//             productDetail.find(
//               (item) => item[0] === formData.productgroup
//             ) || null
//           }
//           onChange={(event, newValue) => {
//             if (newValue) {
//               setFormData((prev) => ({
//                 ...prev,   // ✅ KEEP existing values
              
//                 productgroup: newValue[1],
//                 productfamily: newValue[2]
//               }));
//             } else {
//               setFormData((prev) => ({
//                 ...prev,
               
//                 productgroup: "",
//                 productfamily: ""
//               }));
//             }
//           }}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label="Product Group"
//               size="small"
//               fullWidth
//             />

//           )}
//         />

//         {/* <TextField
//           label="Product Group"
//           size="small"
//           fullWidth
//           value={formData.productgroup || ""}
//           InputProps={{ readOnly: true }}
//         /> */}

//         <TextField
//           label="Product Family"
//           size="small"
//           fullWidth
//           value={formData.productfamily || ""}
//           InputProps={{ readOnly: true }}
//         />
//         {/* <Autocomplete
//           options={(componentUsage || []).filter(
//             (item) => item && item.trim() !== ""
//           )}
//           getOptionLabel={(option) => option || ""}
//           value={formData.componentUsage || null}
//           onChange={(event, newValue) => {
//             setFormData({
//               ...formData,
//               componentUsage: newValue || ""
//             });
//           }}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label="Component Usage"
//               size="small"
//               fullWidth
//             />
//           )}
//         /> */}

//         <ComTextFiled
//           label="Start Date"
//           name="startDate"
//           type="date"
//           value={formData.startDate || ''}
//           onChange={handleInputChange}
//           error={Boolean(formErrors?.startDate)}
//           helperText={formErrors?.startDate || ""}
//           InputLabelProps={{ shrink: true }}
//         />

//         <ComTextFiled
//           label="End Date"
//           name="endDate"
//           type="date"
//           value={formData.endDate}
//           onChange={handleInputChange}
//           error={Boolean(formErrors?.endDate)}
//           helperText={formErrors?.endDate || ""}
//           InputLabelProps={{ shrink: true }}
//         />

//         <Autocomplete
//           options={download}
//           getOptionLabel={(option) => option.label}
//           value={getDownloadValue()} // ✅ FIXED
//           onChange={(e, newValue) => {
//             handlePoChange("download", newValue?.value || null);   // ✅ use null, not ""
//             setFormData(prev => ({
//               ...prev,
//               download: newValue?.value || null,                   // ✅ this line ensures correct value
//               startDate: "",
//               endDate: ""
//             }));
//           }}

//           renderInput={(params) => <TextField {...params} label="Download" size="small" />}
//         />
//       </ThemeProvider>
//     </div>
//   )
// }

// export default IssuanceTATReportTextFiled




import React from 'react'
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { Autocomplete, TextField } from "@mui/material";

const IssuanceTATReportTextFiled = ({
  formData,
  setFormData,
  productDetail,
  componentUsage,
  handleInputChange,
  formErrors,
  handlePoChange,
  ponumberList
}) => {

  const getDateRange = (label) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (label) {
      case "Last 1 Month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "Last 3 Month":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "Last 6 Month":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "Last Year ":
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      default:
        return null;
    }

    const format = (date) => date.toISOString().split('T')[0];
    return { startDate: format(startDate), endDate: format(endDate) };
  };

  const download = [
    "Last 1 Month", "Last 3 Month", "Last 6 Month", "Last Year "
  ].map(label => ({ label, value: getDateRange(label) }));

  const getDownloadValue = () => {
    if (!formData.download || typeof formData.download !== "object") return null;
    return download.find((opt) =>
      JSON.stringify(opt.value) === JSON.stringify(formData.download)
    ) || null;
  };

  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>

        {/* ✅ Product Group dropdown */}
        {/* ✅ Deduplicated Product Group dropdown */}
<Autocomplete
  options={
    productDetail
      .filter((item, index, self) =>
        item[1] && self.findIndex(i => i[1] === item[1]) === index
      )
  }
  getOptionLabel={(option) => option[1] || ""}
  value={
    productDetail.find(
      (item) => item[1] === formData.productgroup
    ) || null
  }
  onChange={(event, newValue) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        productgroup: newValue[1],
        productfamily: newValue[2]
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        productgroup: "",
        productfamily: ""
      }));
    }
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Product Group"
      size="small"
      fullWidth
    />
  )}
/>

        {/* ✅ Product Family — only shows when productgroup is selected */}
        {formData.productgroup && (
          <TextField
            label="Product Family"
            size="small"
            fullWidth
            value={formData.productfamily || ""}
            InputProps={{ readOnly: true }}
          />
        )}

        <ComTextFiled
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate || ''}
          onChange={handleInputChange}
          error={Boolean(formErrors?.startDate)}
          helperText={formErrors?.startDate || ""}
          InputLabelProps={{ shrink: true }}
        />

        <ComTextFiled
          label="End Date"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleInputChange}
          error={Boolean(formErrors?.endDate)}
          helperText={formErrors?.endDate || ""}
          InputLabelProps={{ shrink: true }}
        />

        <Autocomplete
          options={download}
          getOptionLabel={(option) => option.label}
          value={getDownloadValue()}
          onChange={(e, newValue) => {
            handlePoChange("download", newValue?.value || null);
            setFormData(prev => ({
              ...prev,
              download: newValue?.value || null,
              startDate: "",
              endDate: ""
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Download" size="small" />
          )}
        />

      </ThemeProvider>
    </div>
  );
};

export default IssuanceTATReportTextFiled;