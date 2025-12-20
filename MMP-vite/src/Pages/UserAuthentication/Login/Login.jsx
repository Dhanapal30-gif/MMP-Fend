import React, { useState } from "react";
import "./Login.css";
import { TextField, Button, IconButton, InputAdornment, colors } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../../Services/Services";
import { fetchScreens } from "../../../Services/Services_09";
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../../components/Com_Component/TextFiledTheme';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = ({ setUserId ,setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [screen, setScreen] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
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



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const response = await LoginUser(formData);
            const data = response.data; // directly use response.data

            if (!data || !data.empId) { // check if empId exists instead of success
                alert("Login failed");
                return;
            }

            // Store user details
            sessionStorage.setItem("userId", data.empId);
            sessionStorage.setItem("userName", data.empName);
            sessionStorage.setItem("userRole", JSON.stringify(data.userrole));
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", data.empName);
            // localStorage.setItem("allowedScreens", JSON.stringify(response.allowedScreens));
localStorage.setItem("userRole", JSON.stringify(data.userrole));

            setIsLoggedIn(true);
            setUserId(data.empId);

            // Fetch screens
            const roleStr = sessionStorage.getItem("userRole");
            const role = roleStr ? JSON.parse(roleStr) : [];
            if (role.length) {
                const screensRes = await fetchScreens(role);

                const allowedScreens = screensRes.data
                    .map(item => item.split(",")) // splits first string
                    .flat()
                    .map(s => s.trim());
                // Store correctly
                sessionStorage.setItem("allowedScreens", JSON.stringify(allowedScreens));
                  localStorage.setItem("allowedScreens", JSON.stringify(allowedScreens)); // ✅ ADD THIS

                setScreen(allowedScreens); // mounted component
                console.log("allowedScreens:", allowedScreens);

            }
            // Navigate to home AFTER fetching screens
            navigate("/home");
        } catch (error) {
            if (error.response) {
                console.error("Server responded with error:", error.response.data);
                alert(error.response.data.message || "Login failed (server error)");
            } else if (error.request) {
                console.error("No response received:", error.request);
                alert("No response from server. Check your network.");
            } else {
                console.error("Error in request setup:", error.message);
                alert("Login error: " + error.message);
            }
        }
        setFormData({ userId: "", password: "" });
    };

    // Fetch role screens
    const fetchUserRoleData = async (userRole) => {
        if (!userRole) return;

        setLoading(true);
        try {
            const roles = userRole.split(",").map(r => r.trim());
            const response = await fetchScreens(roles);
            sessionStorage.setItem("allowedScreens", JSON.stringify(response.data));
            setScreen(response.data);
        } catch (error) {
            console.error("Error fetching screens", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    return (
        <div className="loginBacground">
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="loginForm-container">
                <h5 style={{ color: "white", fontSize: "17px", fontStyle: 'italic' }}>Welcome Mat Man Pro</h5>
                {/* <div className="cretaeimgae"></div> */}
                <p style={{ color: "white" }}>NOKIA</p>
                <form onSubmit={handleSubmit}>
                    {/* <ThemeProvider theme={TextFiledTheme}> */}

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
                                WebkitTextFillColor: 'white !important',
                                transition: 'background-color 9999s ease-in-out 0s',
                            },
                            '& .MuiFormHelperText-root': { color: 'white' },
                        }}
                    />
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
                            '& .MuiFormHelperText-root': { color: 'white' },
                        }}
                    />

                    <Link
                        to="/forgotPassword"
                        style={{ textDecoration: "none", color: "white", fontSize: "16px", }}
                    >
                        Forgot password
                    </Link>
                    <Button
                        type="submit"
                        variant="contained"
                        // color="primary"
                        fullWidth
                        style={{ marginTop: "15px", backgroundColor: "#40E0D0", color: 'black' }}
                    >
                        Sign In
                    </Button>
                    {/* </ThemeProvider> */}
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