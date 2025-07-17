import React from 'react'
import { createTheme } from '@mui/material/styles';

const TextFiledTheme = {
   components: {
   
       MuiAutocomplete: {
  styleOverrides: {
    paper: {
      "& .MuiAutocomplete-option": {
        fontSize: '14px',      // Font size of options
        minHeight: '24px',     // Height of each dropdown item
        paddingTop: '2px',
        paddingBottom: '2px',
      },
    },
    root: {
      fontSize: '14px',
      "&.MuiInputLabel-shrink": {
        color: 'green',
        fontSize: '17px',
        fontWeight: 'bold', // ✅ This works here
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
        },
      },
    },
    MuiInputLabel: {
   styleOverrides: {
    root: {
      fontSize: '13px',
      fontWeight: 'bold',
      "&.MuiInputLabel-shrink": {
        color: 'hsl(226, 55.60%, 53.10%)',         // ✅ Floating label color
        fontWeight: 'bold',     // ✅ Floating label weight
        fontSize: '17px',       // (optional) floating label size
      },
    },
  },

    },
  },
}
export default TextFiledTheme