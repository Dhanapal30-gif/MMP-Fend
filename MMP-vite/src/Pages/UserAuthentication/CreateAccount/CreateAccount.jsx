import React, { useState, useEffect } from 'react';
import './CreateAccount.css';
import { TextField, IconButton, InputAdornment, Autocomplete, Button, FormGroup, FormControlLabel, Checkbox, FormLabel } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { CreateAccountUser, fetchProdcutDetail, fetchUserRole, getProduct } from '../../../Services/Services';
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../../components/Com_Component/TextFiledTheme';
import CustomDialog from "../../../components/Com_Component/CustomDialog";
import { useLocation } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { updateUserDetail } from '../../../Services/Services_09';
// import Image from "../../assets/Nokia_9-removebg-preview.png";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [storeProduct, setStoreProduct] = useState([]);
  const location = useLocation();
  const editFormData = location.state?.formData || {};
  const isEdit = location.state?.isEdit || false;
  const [showPassword, setShowPassword] = useState(false);


  const [formData, setFormData] = useState({

    userId: '',
    userName: '',
    userRole: [],
    requesterType: [],
    requestType: [],
    emailAddress: '',
    phoneNumber: '',
    password: '',
    createdBy: '',
    modifiedBy: '',
    adminPassword: '',
    productGroup: [],
    productname: []
  });

  useEffect(() => {
    if (isEdit && storeProduct.length > 0) {
      // unique product groups/names from storeProduct
      const availableGroups = [...new Set(storeProduct.map(item => item.productGroup))];
      const availableNames = [...new Set(storeProduct.map(item => item.productName))];

      // convert editFormData.productname to strings if needed
      const editProductNames = editFormData.productname?.map(p =>
        typeof p === 'object' ? (p.value || p.label || "").trim() : p.trim()
      ) || [];

      setFormData(prev => ({
        ...prev,
        ...editFormData,
        productGroup: Array.isArray(editFormData.productGroup)
          ? editFormData.productGroup.map(pg => pg.trim()).filter(pg => availableGroups.includes(pg))
          : availableGroups.includes(editFormData.productGroup?.trim())
            ? [editFormData.productGroup.trim()]
            : [],
        productname: editProductNames.filter(pn => availableNames.includes(pn))
      }));
    }
  }, [isEdit, editFormData, storeProduct]);


  const [userRoleData, setUserRoleData] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const errors = {};
    let isValid = true;

    if (!formData.userId.trim()) {
      errors.userId = 'User ID is required';
      isValid = false;
    }
    if (!formData.userName.trim()) {
      errors.userName = 'User Name is required';
      isValid = false;
    }
    if (formData.userRole.length === 0) {
      errors.userRole = 'User Role is required';
      isValid = false;
    }

     if (!(formData.afa || "").trim()) {
      errors.afa = 'Account Active is required';
      isValid = false;
    }

    if (formData.userRole.includes("Requester") && formData.requesterType.length === 0) {
      errors.requesterType = 'RequesterType is required';
      isValid = false;
    }

    if (formData.requesterType?.includes("Material Request") && formData.requestType.length === 0) {
      errors.requestType = 'Request Type is required';
      isValid = false;
    }

    if (
      (
        formData.requestType?.includes("Sub Module") ||
        formData.requestType?.includes("others") ||
        formData.requestType?.includes("Thermal Gel")
      ) &&
      formData.productGroup.length === 0
    ) {
      errors.productGroup = 'productGroup is required';
      isValid = false;
    }

    if (formData.userRole?.includes("Repairer") && formData.productname.length === 0) {
      errors.productname = 'productName is required';
      isValid = false;
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required';
      isValid = false;
    }
    if (!formData.emailAddress) {
      errors.emailAddress = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      errors.emailAddress = 'Email address is invalid';
      isValid = false;
    }
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 5) {
      errors.password = 'Password must be at least 5 characters';
      isValid = false;
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      errors.password = 'Password must contain a special character';
      isValid = false;
    }
    if (!formData.adminPassword) {
      errors.adminPassword = 'adminPassword is required';
      isValid = false;
    }

    console.log("errors", errors)
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const user = sessionStorage.getItem("userName") || "System";
      const updatedFormData = {
        ...formData,
        createdBy: user,
        modifiedBy: user
      };

      CreateAccountUser(updatedFormData)
        .then((response) => {

          setSuccessMessage(response.data.message)
          setShowSuccessPopup(true)
          navigate("/");
          setFormData({
            userId: '',
            userName: '',
            userRole: [],
            emailAddress: '',
            phoneNumber: '',
            password: '',
            requesterType: [],
            requestType: [],
            adminPassword: ''
          });
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.status === 409) {
              setErrorMessage(error.response.data.message);
              setShowErrorPopup(true);
            } else {
              setErrorMessage(error.response.data.message);
              setShowErrorPopup(true);
            }
          } else {
            setErrorMessage("Network error, please try again");
            setShowErrorPopup(true);
          }
        });


    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (validate()) {
      const user = sessionStorage.getItem("userName") || "System";
      const updatedFormData = {
        ...formData,
        modifiedBy: user
      };

      updateUserDetail(updatedFormData)
        .then((response) => {
          setSuccessMessage(response.data.message)
          setShowSuccessPopup(true)
          navigate("/userDetail");
          setFormData({
            userId: '',
            userName: '',
            userRole: [],
            emailAddress: '',
            phoneNumber: '',
            password: '',
            requesterType: [],
            requestType: [],
            adminPassword: ''
          });
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.status === 409) {
              setErrorMessage(error.response.data.message);
              setShowErrorPopup(true);
            } else {
              setErrorMessage(error.response.data.message);
              setShowErrorPopup(true);
            }
          } else {
            setErrorMessage("Network error, please try again");
            setShowErrorPopup(true);
          }
        });


    }
  };

  const fetchUserRoleData = async () => {
    try {
      const response = await fetchUserRole();
      setUserRoleData(response.data);
    } catch (error) {
      console.error("Error fetching user roles", error);
    }
  };
  const getProductDetail = () => {
    getProduct()
      .then((response) => {
        setStoreProduct(response.data);
      })
  }


  useEffect(() => {
    fetchUserRoleData();
    getProductDetail()
  }, []);

  const [productGroup, setProductGroup] = useState([]);
  const [productName, setProductName] = useState([]);

  useEffect(() => {
    const uniqueGroups = [
      ...new Map(storeProduct.map(item => [item.productGroup, item])).values()
    ].map(item => item.productGroup);

    setProductGroup(uniqueGroups);
  }, [storeProduct]);

  useEffect(() => {
    const uniqueGroups = [
      ...new Map(storeProduct.map(item => [item.productName, item])).values()
    ].map(item => item.productName);

    setProductName(uniqueGroups);
  }, [storeProduct]);

  return (
    <div className="cretaeBackgroundimgae">
      <div className="form-container">

        <div className="form-header">
          <div className="cretaeimgaeuyef"></div>
          <div className="form-header-text">
            <h2 className="form-title">{isEdit ? "Edit account" : "Create account"}</h2>
            <p className="form-subtitle">
              {isEdit
                ? "Update sign-in details and permissions for this user."
                : "Set up sign-in access and assign permissions."}
            </p>
          </div>
        </div>

        <form className="form-body" onSubmit={isEdit ? handleUpdate : handleSubmit}>
          <div className="form-grid">

            <section className="form-section">
              <h3 className="form-section-title">Account &amp; product details</h3>
              <div className='ProductTexfiled'>
                <ThemeProvider theme={TextFiledTheme}>

                  <TextField
                    label="User ID"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    error={Boolean(formErrors.userId)}
                    helperText={formErrors.userId}
                    fullWidth
                    size="small"
                  />


                  <TextField
                    label="User Name"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    error={Boolean(formErrors.userName)}
                    helperText={formErrors.userName}
                    fullWidth
                    size="small"
                  />


                  <TextField
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={Boolean(formErrors.phoneNumber)}
                    helperText={formErrors.phoneNumber}
                    fullWidth
                    size="small"
                  />

                  <TextField
                    label="Email Address"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    error={Boolean(formErrors.emailAddress)}
                    helperText={formErrors.emailAddress}
                    fullWidth
                    size="small"
                  />


                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    error={Boolean(formErrors.password)}
                    helperText={formErrors.password}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    label="adminPassword"
                    name="adminPassword"
                    type="password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    error={Boolean(formErrors.adminPassword)}
                    helperText={formErrors.adminPassword}
                    fullWidth
                    size="small"
                  />



                  {(formData.requestType?.includes("Sub Module") || formData.requestType?.includes("others") || formData.requestType?.includes("Thermal Gel")) && (

                    <Autocomplete
                      multiple
                      options={productGroup}
                      getOptionLabel={(option) => option || ""}
                      value={formData.productGroup || []}
                      onChange={(event, newValue) =>
                        setFormData(prev => ({ ...prev, productGroup: newValue || [] }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Product Group"
                          name="productGroup"
                          error={Boolean(formErrors.productGroup)}
                          helperText={formErrors.productGroup}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    />
                  )}

                  {(formData.userRole?.includes("Repairer")) && (

                    <Autocomplete
                      multiple
                      options={productName}
                      getOptionLabel={(option) => option || ""}
                      value={formData.productname || []}
                      onChange={(event, newValue) =>
                        setFormData(prev => ({ ...prev, productname: newValue || [] }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Product Name"
                          name="asignUserrole"
                          error={Boolean(formErrors.productname)}
                          helperText={formErrors.productname}
                          variant="outlined"
                          size="small"
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-tag": {
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        },
                        "& .MuiAutocomplete-inputRoot": {
                          maxHeight: "120px",
                          overflowY: "auto"
                        }
                      }}
                    />
                  )}

                </ThemeProvider>

              </div>
            </section>

            <section className="form-section">
              <h3 className="form-section-title">Roles &amp; permissions</h3>
              <div className="RoleFields">
                <ThemeProvider theme={TextFiledTheme}>

                  {userRoleData.length > 0 && (
                    <Autocomplete
                      multiple
                      options={userRoleData}
                      getOptionLabel={(option) => option || ""}
                      value={formData.userRole || []}
                      onChange={(event, newValue) =>
                        setFormData(prev => ({ ...prev, userRole: newValue || [] }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="User Role"
                          error={Boolean(formErrors.userRole)}
                          helperText={formErrors.userRole}
                          variant="outlined"
                          size="small"
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-tag": {
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        },
                        "& .MuiAutocomplete-inputRoot": {
                          maxHeight: "120px",
                          overflowY: "auto"
                        }
                      }}
                    />
                  )}

                  {formData.userRole.includes("Requester") && (
                    <Autocomplete
                      multiple
                      options={[
                        "Material Request",
                        "Scrap Request",
                        "Stock Transfer Request",
                        "Material Request Projects"
                      ]}
                      getOptionLabel={(option) => option || ""}
                      value={formData.requesterType || []}
                      onChange={(event, newValue) =>
                        setFormData(prev => ({ ...prev, requesterType: newValue || [] }))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Requester Type"
                          error={Boolean(formErrors.requesterType)}
                          helperText={formErrors.requesterType}
                          variant="outlined"
                          size="small"
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-tag": {
                          maxWidth: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        },
                        "& .MuiAutocomplete-inputRoot": {
                          maxHeight: "120px",
                          overflowY: "auto"
                        }
                      }}
                    />
                  )}

                  <Autocomplete
                    multiple
                    options={["Sub Module", "others", "Thermal Gel"]}
                    getOptionLabel={(option) => option || ""}
                    value={formData.requestType || []}
                    onChange={(event, newValue) =>
                      setFormData(prev => ({ ...prev, requestType: newValue || [] }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Request Type"
                        error={Boolean(formErrors.requestType)}
                        helperText={formErrors.requestType}
                        variant="outlined"
                        size="small"
                      />
                    )}
                    sx={{
                      "& .MuiAutocomplete-tag": {
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      },
                      "& .MuiAutocomplete-inputRoot": {
                        maxHeight: "120px",
                        overflowY: "auto"
                      }
                    }}
                  />

                  <Autocomplete
                    options={["Active", "Deactive"]}
                    getOptionLabel={(option) => option || ""}
                    value={formData.afa || null}
                    onChange={(event, newValue) =>
                      setFormData({ ...formData, afa: newValue || "" })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Active For Account"
                        variant="outlined"
                        error={Boolean(formErrors.afa)}
                        helperText={formErrors.afa}
                        size="small"
                        className="ProductTexfiled-textfield"
                      />
                    )}
                    sx={{
                      "& .MuiAutocomplete-tag": {
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      },
                      "& .MuiAutocomplete-inputRoot": {
                        maxHeight: "120px",
                        overflowY: "auto"
                      }
                    }}
                  />

                </ThemeProvider>
              </div>
            </section>

          </div>

          <div className="form-actions">
            <Button type="submit" variant="contained" color="primary"
              fullWidth
              className="form-submit-btn"
            >
              {isEdit ? "Edit Account" : "Create Account"}
            </Button>
            {isEdit && (
              <Button
                variant="contained"
                color="secondary"
                className="form-cancel-btn"
                onClick={() => navigate("/userDetail")}
              >
                Cancel
              </Button>
            )}

            <div className="form-footer-link">
              {!isEdit &&
                <Link to="/" style={{ textDecoration: 'none' }}>
                  Already have an account? Sign in
                </Link>}
            </div>
          </div>
        </form>
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
export default CreateAccount;
