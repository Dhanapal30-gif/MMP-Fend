import React, { useState } from "react";
import "./Login.css";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { forGotUserPassword } from "../../../Services/Services";
import CustomDialog from "../../../components/Com_Component/CustomDialog";

const ForgotPassword = ({ setUserId }) => {
    const navigate = useNavigate();
    const [newshowPassword, setNewShowPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [screen, setScreen] = useState([]);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        emailAddress: "",
        newPassword: "",
        password: ""
    });

    const [formErrors, setFormErrors] = useState({});

    // ✅ Input change handler with email validation
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (name === "emailAddress") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setFormErrors((prev) => ({
                ...prev,
                emailAddress: emailRegex.test(value) ? "" : "Enter valid email address"
            }));
        }
    };
    const validate = () => {
        const errors = {};

        // Email validation
        if (!formData.emailAddress) {
            errors.emailAddress = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.emailAddress)) {
                errors.emailAddress = "Enter valid email address";
            }
        }

        // Password validation
        if (!formData.newPassword) {
        errors.newPassword = "New Password is required";
    } else {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{7,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            errors.newPassword =
                "Password must be at least 7 characters, include 1 capital letter, 1 number, and 1 special character";
        }
    }


        if (!formData.password) {
            errors.password = "Confirm Password is required";
        }

        // Check if passwords match
        if (formData.newPassword && formData.password && formData.newPassword !== formData.password) {
            errors.password = "Passwords do not match";
        }

        setFormErrors(errors);

        // Return true only if no errors
        return Object.keys(errors).length === 0;
    };
    // ✅ Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            const response = await forGotUserPassword(formData);
            const data = response.data; // for 2xx responses

            if (data.success) {
                // alert("Password updated successfully ✅");
                setShowSuccessPopup(true);
                setSuccessMessage("Password updated successfully ✅");
                setFormData({ emailAddress: "", password: "" });
                navigate("/");
            } else {
                // alert(data.message);
                setErrorMessage(data.message);
                setShowErrorPopup(true);
            }
        } catch (error) {
            // Axios error object
            if (error.response && error.response.data) {
                // Backend returned JSON with 4xx/5xx
                // alert(error.response.data.message); 
                setErrorMessage(error.response.data.message);
                setShowErrorPopup(true);
            } else {
                // Network or other errors
                // alert("Something went wrong. Please try again.");
                setErrorMessage("Something went wrong. Please try again.");
                setShowErrorPopup(true);
            }
        }

    };


    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleClickShowPassworrd = () => setNewShowPassword(!newshowPassword);

    return (
        <div className="loginBacground">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>

            <div className="loginForm-container">
                <h5 style={{ color: "white", fontSize: "17px", fontStyle: "italic" }}>
                    Welcome Mat Man Pro
                </h5>

                <p style={{ color: "white" }}>NOKIA</p>

                <form onSubmit={handleSubmit}>
                    {/* ✅ Email Field */}
                    <TextField
                        label="EmailAddress"
                        variant="outlined"
                        fullWidth
                        type="text"
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        error={Boolean(formErrors.emailAddress)}
                        helperText={formErrors.emailAddress}
                        size='small'
                        sx={{
                            input: {
                                color: 'white',
                                backgroundColor: 'transparent',
                                userSelect: 'none',
                                WebkitBoxShadow: '0 0 0 1000px transparent inset', // removes blue autofill
                                WebkitTextFillColor: 'white', // keep text white
                            },
                            label: { color: 'white' },
                            '& label.Mui-focused': { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: '#ddd' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& input:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                                WebkitTextFillColor: '#ddd !important',
                                transition: 'background-color 9999s ease-in-out 0s',
                            },
                            '& .MuiFormHelperText-root': { color: 'white' },
                        }}
                    />

                    {/* ✅ New Password */}
                    {/* <TextField
                        label="New Password"
                        variant="outlined"
                        fullWidth
                        type={newshowPassword ? "text" : "newPassword"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        error={Boolean(formErrors.newPassword)}
                        helperText={formErrors.newPassword}
                        margin="normal"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowPassworrd} edge="end" sx={{ color: "white" }}>
                                        {newshowPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            input: { color: "white" },
                            label: { color: "white" },
                            "& label.Mui-focused": { color: "white" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "white" },
                                "&:hover fieldset": { borderColor: "#ddd" },
                                "&.Mui-focused fieldset": { borderColor: "white" }
                            },
                            "& .MuiFormHelperText-root": { color: "green" }
                        }}
                    /> */}
                    <TextField
                        label="NewPassword"
                        variant="outlined"
                        fullWidth
                        type={newshowPassword ? 'text' : 'password'} // show dots if false
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        error={Boolean(formErrors.newPassword)}
                        helperText={formErrors.newPassword}
                        margin="normal"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowPassworrd} edge="end"
                                        sx={{ color: 'white' }}>
                                        {newshowPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            input: {
                                color: 'white',
                                backgroundColor: 'transparent',
                                userSelect: 'none',
                                WebkitBoxShadow: '0 0 0 1000px transparent inset',
                                WebkitTextFillColor: 'white',
                            },
                            label: { color: 'white' },
                            '& label.Mui-focused': { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: '#ddd' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& input:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                                WebkitTextFillColor: 'white !important',
                                transition: 'background-color 9999s ease-in-out 0s',
                            },
                            '& .MuiFormHelperText-root': { color: '#ddd' },
                        }}
                    />
                    {/* ✅ Confirm Password */}
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        type={showPassword ? 'text' : 'password'} // show dots if false
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={Boolean(formErrors.password)}
                        helperText={formErrors.password}
                        margin="normal"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowPassword} edge="end"
                                        sx={{ color: 'white' }}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            input: {
                                color: 'white',
                                backgroundColor: 'transparent',
                                userSelect: 'none',
                                WebkitBoxShadow: '0 0 0 1000px transparent inset',
                                WebkitTextFillColor: 'white',
                            },
                            label: { color: 'white' },
                            '& label.Mui-focused': { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: '#ddd' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& input:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
                                WebkitTextFillColor: 'white !important',
                                transition: 'background-color 9999s ease-in-out 0s',
                            },
                            '& .MuiFormHelperText-root': { color: '#ddd' },
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        style={{ marginTop: "15px", backgroundColor: "#40E0D0", color: "black" }}
                    >
                        Reset
                    </Button>
                </form>

                <Link
                    to="/createAccount"
                    style={{ textDecoration: "none", color: "white", fontSize: "16px", fontStyle: "italic" }}
                >
                    Don't have an account? Sign Up
                </Link>
            </div>
            <CustomDialog
                open={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                title="Success"
                message={successMessage}
                severity="success"
                color="primary"
            />
            <CustomDialog
                open={showErrorPopup}
                onClose={() => setShowErrorPopup(false)}
                title="Error"
                message={errorMessage}
                severity="error"
                color="secondary"
            />
        </div>
    );
};

export default ForgotPassword;
