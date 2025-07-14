import React, { useState } from "react";
import "./Login.css";
import { TextField, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../ServicesComponent/Services";

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: "",
        password: ""
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const validate = () => {
        const errors = {};
        let isValid = true;

        if (!formData.userId.trim()) {
            errors.userId = "User ID is required";
            isValid = false;
        }
        if (!formData.password) {
            errors.password = "Password is required";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            LoginUser(formData)
                .then((response) => {
                    if (response.data) {
                        // Store user details in session storage
                        sessionStorage.setItem("userId", response.data.empId); // Corrected Line
                        sessionStorage.setItem("userName", response.data.empName);
                        sessionStorage.setItem("userRole", response.userRole);
                        sessionStorage.setItem("isLoggedIn", "true");

                        console.log("User Name:", response.data.empName);
                        console.log("User Id:", response.data.empId);
                        console.log("Full Response:", response.data);

                        navigate("/home");
                    } else {
                        alert(response.message || "Login failed");
                    }
                })
                .catch((error) => {
                    console.error("Error logging in:", error);
                    alert("An error occurred during login.");
                });

            setFormData({
                userId: "",
                password: ""
            });
        }
    };


    return (
        <div className="loginBacground">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            
            
            <div className="loginForm-container">
                <h5 style={{ color: "white", fontSize: "17px", fontStyle: 'italic' }}>Welcome Mat Man Pro</h5>
                <div className="cretaeimgae"></div>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="User ID"
                        variant="outlined"
                        fullWidth
                        type="text"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        error={Boolean(formErrors.userId)}
                        helperText={formErrors.userId}

                        size='small'

                        sx={{
                            input: { color: 'white' }, // input text
                            label: { color: 'white' }, // label when unfocused
                            '& label.Mui-focused': { color: 'white' }, // label when focused
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: '#ddd' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'white', // helper text color
                            }
                        }}
                    />
                    <TextField
                        label="password"
                        variant="outlined"
                        fullWidth
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={Boolean(formErrors.password)}
                        helperText={formErrors.password}
                        margin="normal"
                        size='small'
                        sx={{
                            input: { color: 'white' }, // input text
                            label: { color: 'white' }, // label when unfocused
                            '& label.Mui-focused': { color: 'white' }, // label when focused
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'white' },
                                '&:hover fieldset': { borderColor: '#ddd' },
                                '&.Mui-focused fieldset': { borderColor: 'white' },
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'white', // helper text color
                            }
                        }}
                    />



                    <Button
                        type="submit"
                        variant="contained"
                        // color="primary"
                        fullWidth
                        style={{ marginTop: "15px" ,backgroundColor:"#40E0D0",color:'black'}}
                    >
                        Sign In
                    </Button>
                </form>
                <Link
                    to="/createAccount"
                    style={{ textDecoration: "none", color: "white", fontSize: "16px", fontStyle: 'italic' }}
                >
                    Don't have an account? Sign Up
                </Link>
            </div>
        </div>
    );
};

export default Login;