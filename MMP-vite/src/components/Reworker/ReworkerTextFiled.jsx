import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ReworkerTextFiled = ({ formData, setFormData,setErrorMessage,setShowErrorPopup,setTableData, isFrozen, partOptions, handleChange, productOptions, handlePoChange,tableData, formErrors }) => {

   const handleSearchClick = () => {
        const foundRow = tableData.find(
            row => row.boardserialnumber === formData.productname
        );
        setFormData({
                Type: ""
            })
           
        if (foundRow) {
            setFormData({ ...formData, ...foundRow });
        } else {
            setErrorMessage("No record found for this serial number");
            setShowErrorPopup(true);
            // alert("No record found for this serial number");
        }
    };

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <ComTextFiled
                    label="Module Serial Number"
                    name="productname"
                    // value={formData.productname}
                    onChange={handleChange}
                  
                    sx={{ width: '320px' }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleSearchClick}
                                    edge="end"
                                    sx={{
                                        backgroundColor: '#1976d2',
                                        color: '#fff',
                                        padding: '5px',
                                        '&:hover': {
                                            backgroundColor: '#115293',
                                        },
                                        borderRadius: '50%',
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </ThemeProvider>
            
        </div>
    );
};

export default ReworkerTextFiled;
