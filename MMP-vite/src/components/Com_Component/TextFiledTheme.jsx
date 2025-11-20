// import React from 'react'
// import { createTheme } from '@mui/material/styles';

// const TextFiledTheme = {
//    components: {
   
//        MuiAutocomplete: {
//   styleOverrides: {
//     paper: {
//       "& .MuiAutocomplete-option": {
//         fontSize: '14px',      // Font size of options
//         minHeight: '24px',     // Height of each dropdown item
//         paddingTop: '2px',
//         paddingBottom: '2px',
//       },
//     },
//     root: {
//       fontSize: '14px',
//       "&.MuiInputLabel-shrink": {
//         color: 'green',
//         fontSize: '17px',
//         fontWeight: 'bold', // ✅ This works here
//       },
//     },
//   },
// },
//     MuiTextField: {
//       defaultProps: {
//         size: 'small',
        
//       },
      
     
//     },
//     MuiInputBase: {
//       styleOverrides: {
//         input: {
//           fontSize: '14px',
//         },
//       },
//     },
//     MuiInputLabel: {
//    styleOverrides: {
//     root: {
//       fontSize: '13px',
//       fontWeight: 'bold',
//       "&.MuiInputLabel-shrink": {
//         color: 'hsl(226, 55.60%, 53.10%)',         // ✅ Floating label color
//         fontWeight: 'bold',     // ✅ Floating label weight
//         fontSize: '17px',       // (optional) floating label size
//       },
//     },
//   },

//     },
//   },
// }
// export default TextFiledTheme


import { createTheme } from '@mui/material/styles';

const TextFiledTheme = createTheme({
  typography: {
    fontFamily: `'Roboto', sans-serif`,
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          "& .MuiAutocomplete-option": {
            fontSize: '13px',
            // fontWeight:700,
            minHeight: '24px',
            paddingTop: '2px',
            paddingBottom: '2px',
            fontFamily: `'Roboto', sans-serif`,
          },
        },
        root: {
          fontSize: '14px',
          fontFamily: `'Roboto', sans-serif`,
          "&.MuiInputLabel-shrink": {
            color: 'green',
            fontSize: '17px',
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '14px',
          fontFamily: `'Roboto', sans-serif`,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '12px',
          fontWeight: 'bold',
          fontFamily: `'Roboto', sans-serif`,
          "&.MuiInputLabel-shrink": {
            color: 'hsl(226, 55.60%, 53.10%)',
            fontWeight: 'bold',
            fontSize: '17px',
            fontFamily: `'Roboto', sans-serif`,
          },
        },
      },
    },
  },
});

export default TextFiledTheme;
