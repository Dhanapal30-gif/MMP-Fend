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
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchSearchBoard } from '../../Services/Services-Rc';

const ReworkerTextFiled = ({
  formData,
  setFormData,
  setErrorMessage,
  setShowErrorPopup,
  setBoardFetch,
  handleChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(formData.searchBoardserialNumber || '');

  // Debounce fetch after 3 seconds
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm && searchTerm.trim() !== '') {
        fetchSearchBoard(searchTerm)
          .then((response) => {
            const data = response.data;
            if (data && data.length > 0) {
              setBoardFetch(data);
              setFormData((prev) => ({ ...prev, ...data[0] }));
            } else {
              setErrorMessage("No record found for this serial number.");
              setShowErrorPopup(true);
            }
          })
          .catch((error) => {
            setErrorMessage("Error fetching board details.");
            setShowErrorPopup(true);
          });
      }
    }, 300); // 3 seconds

    return () => clearTimeout(handler); // cleanup on change
  }, [searchTerm]);

  return (
    <div className="ComCssTexfiled">
      <ThemeProvider theme={TextFiledTheme}>
        <ComTextFiled
          label="Module Serial Number"
          name="searchBoardserialNumber"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleChange(e);
          }}
          sx={{ width: '320px' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearchTerm(formData.searchBoardserialNumber)}
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
      </ThemeProvider>
    </div>
  );
};

export default ReworkerTextFiled;
