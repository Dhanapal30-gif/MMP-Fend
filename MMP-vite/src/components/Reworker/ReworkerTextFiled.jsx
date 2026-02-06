// import React from 'react';
// import { ThemeProvider } from '@mui/material/styles';
// import ComTextFiled from '../Com_Component/ComTextFiled';
// import TextFiledTheme from '../Com_Component/TextFiledTheme';
// import { InputAdornment, IconButton } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import { fetchSearchBoard } from '../../Services/Services-Rc';
// // import { fetchRepairNBoard } from '../../api/RepairApi'; // ✅ import your API function

// const ReworkerTextFiled = ({
//   formData,
//   setFormData,
//   setErrorMessage,
//   setShowErrorPopup,
//   setTableData,
//   isFrozen,
//   partOptions,
//   handleChange,
//   productOptions,
//   handlePoChange,
//   tableData,
//   formErrors,
//   setBoardFetch,
// boardFetch
// }) => {

//   const handleSearchClick = () => {
//     const searchTerm = formData.searchBoardserialNumber; // ✅ get search input value
// console.log("formData",formData)
//     if (!searchTerm) {
//       console.warn("Please enter a module serial number.");
//       setErrorMessage("Please enter a module serial number.");
//       setShowErrorPopup(true);
//       return;
//     }

//     fetchSearchBoard(searchTerm)
//   .then((response) => {
//     const data = response.data; // directly use response.data
//     if (data && data.length > 0) {
//       setBoardFetch(data);
//       setFormData({ ...formData, ...data[0] });
//     } else {
//       console.warn("No content found:", data);
//       setErrorMessage("No record found for this serial number.");
//       setShowErrorPopup(true);
//     }
//   })
//   .catch((error) => {
//     console.error("Error fetching board data:", error);
//     setErrorMessage("Error fetching board details.");
//     setShowErrorPopup(true);
//   });
//   };

//   return (
//     <div className="ComCssTexfiled">
//       <ThemeProvider theme={TextFiledTheme}>
//         <ComTextFiled
//           label="Module Serial Number"
//           name="searchBoardserialNumber"
//           value={formData.searchBoardserialNumber || ""}
//           onChange={handleChange}
//           sx={{ width: '320px' }}
//           InputProps={{
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={handleSearchClick}
//                   edge="end"
//                   sx={{
//                     backgroundColor: '#1976d2',
//                     color: '#fff',
//                     padding: '5px',
//                     '&:hover': {
//                       backgroundColor: '#115293',
//                     },
//                     borderRadius: '50%',
//                   }}
//                 >
//                   <SearchIcon />
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />
        
//       </ThemeProvider>
//     </div>
//   );
// };

// export default ReworkerTextFiled;



// 



import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton,Autocomplete, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchSearchBoard, fetchSearchBoardSerialNumber } from '../../Services/Services-Rc';
import MenuItem from '@mui/material/MenuItem';

const ReworkerTextFiled = ({
  formData,
  setFormData,
  setErrorMessage,
  setShowErrorPopup,
  setBoardFetch,
  handleChange,
  setLoading,
  setSearchScanText,
  searchScanText,
  setRequestButton,
  setSelectedGrnRows,
  setBoardType,
  setBoardTypeDropdown,
  boardType,
  boardTypeDropdown,
  setShowTable,
  setTableData
}) => {
  // const [searchTerm, setSearchTerm] = useState(formData.searchBoardserialNumber || '');

    // searchScanText = useState(formData.searchBoardserialNumber || '');
    
  useEffect(() => {
    if (formData.searchBoardserialNumber) {
      setSearchScanText(formData.searchBoardserialNumber);
    }
  }, [formData.searchBoardserialNumber]);


//   const handleTypeChange = (reworkType) => {
//   setFormData(prev => ({ ...prev, reworkType }));

//   const filtered = boardType.filter(d => d.type === reworkType);
//   setBoardFetch(filtered);
//   setShowTable(true);
// };

const handleTypeChange = (reworkType) => {
  setFormData(prev => ({ ...prev, reworkType }));

  if (!searchScanText?.trim()) return;

  setLoading(true);
  fetchSearchBoardSerialNumber(searchScanText, reworkType)
    .then((response) => {
      const data = response.data;

      if (!data || data.length === 0) return;

      setBoardFetch(data);
      setShowTable(true);
      // setBoardTypeDropdown([]);   // hide dropdown after select
      setFormData(prev => ({ ...prev, ...data[0], reworkType }));
      setRequestButton(true);
      setSelectedGrnRows([]);
    })
    .finally(() => setLoading(false));
};

/*
const handleSearchClick = () => {
  if (!searchScanText || !searchScanText.trim()) return;

  setLoading(true);
  fetchSearchBoard(searchScanText)
    .then((response) => {
      const data = response.data;
      if (data && data.length > 0) {
        setBoardFetch(data);
        setFormData((prev) => ({ ...prev, ...data[0] }));
        setRequestButton(true);
        setBoardType()
        setSelectedGrnRows([]);
        setBoardTypeDropdown(true)
      } else {
        setErrorMessage("No record found for this serial number.");
        setShowErrorPopup(true);
        setSearchScanText("");
      }
    })
    .catch(() => {
      setErrorMessage("Error fetching board details.");
      setShowErrorPopup(true);
    })
    .finally(() => setLoading(false));
};


*/
const handleSearchClick = () => {
  if (!searchScanText?.trim()) return;

  setLoading(true);
    setTableData([]);
  fetchSearchBoardSerialNumber(searchScanText)
    .then((response) => {
      const data = response.data;

      if (!data || data.length === 0) {
        setErrorMessage("No record found");
        setShowErrorPopup(true);
        return;
      }

      // 🔹 CASE 1: types only (array of strings)
      if (typeof data[0] === "string") {
        setBoardTypeDropdown(data);   // dropdown options
        setBoardFetch([]);            // clear table
        setShowTable(false);
        setFormData(prev => ({ ...prev, reworkType: "" }));
        return;
      }

      // 🔹 CASE 2: full object data
      setBoardType(data);
      setBoardFetch(data);
      setShowTable(true);
      setBoardTypeDropdown([]);       // hide dropdown
      setFormData(prev => ({ ...prev, ...data[0] }));
      setRequestButton(true);
      setSelectedGrnRows([]);
    
    })
    .finally(() => setLoading(false));
};



  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <ComTextFiled
          label="Module Serial Number"
          name="searchBoardserialNumber"
          value={searchScanText}
          onChange={(e) => {
            setSearchScanText(e.target.value);
            handleChange(e);
          }}
          sx={{ width: '320px' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  // onClick={() => setSearchScanText(formData.searchBoardserialNumber)}
               onClick={handleSearchClick}
                  edge="end"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    padding: '3.5px',
                    '&:hover': { backgroundColor: '#115293' },
                    borderRadius: '19%',
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {boardTypeDropdown.length > 0 && (
        
           <Autocomplete
    options={boardTypeDropdown}
    value={formData.reworkType || null}
    onChange={(e, newValue) => {
      if (newValue) handleTypeChange(newValue);
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Select Type"
        size="small"
      />
    )}
  />
        )}


          
      </ThemeProvider>
    </div>
  );
};

export default ReworkerTextFiled;
