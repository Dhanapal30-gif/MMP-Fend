import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../Com_Component/ComTextFiled';
import TextFiledTheme from '../Com_Component/TextFiledTheme';
import { InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ReworkerTextFiled = ({ formData, setFormData, isFrozen, partOptions, handleChange, productOptions, handlePoChange, formErrors }) => {

    const handleSearchClick = () => {
        console.log("Search clicked", formData.productname);
    };

    return (
        <div className="ComCssTexfiled">
            <ThemeProvider theme={TextFiledTheme}>
                <ComTextFiled
                    label="Module Serial Number"
                    name="productname"
                    value={formData.productname}
                    onChange={handleChange}
                    error={Boolean(formErrors?.productname)}
                    helperText={formErrors?.productname || ""}
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
