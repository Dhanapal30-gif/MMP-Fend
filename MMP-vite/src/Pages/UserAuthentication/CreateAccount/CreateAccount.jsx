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
    const availableGroups = [...new Set(storeProduct.map(item => item.productGroup))]; // unique
    const availableNames = storeProduct.map(item => item.productName);

    setFormData({
      ...editFormData,
      userRole: editFormData.userRole || [],
      requesterType: editFormData.requesterType || [],
      requestType: editFormData.requestType || [],
      productGroup: Array.isArray(editFormData.productGroup)
        ? editFormData.productGroup.filter(pg => availableGroups.includes(pg))
        : availableGroups.includes(editFormData.productGroup)
          ? [editFormData.productGroup]
          : [],
      productname: editFormData.productname?.filter(pn => availableNames.includes(pn)) || []
    });
  }
}, [isEdit, editFormData, storeProduct]);


console.log("editFormData",editFormData)


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
    // if (formData.requesterType.length === 0) {
    //   errors.requesterType = 'RequesterType is required';
    //   isValid = false;
    // }
    if (formData.userRole.includes("Requester") && formData.requesterType.length === 0) {
      errors.requesterType = 'RequesterType is required';
      isValid = false;
    }

    if (formData.requesterType?.includes("Material Request") && formData.requestType.length === 0) {
      errors.requestType = 'Request Type is required';
      isValid = false;
    }

    // if (formData.requestType?.includes("Submodule") || formData.requestType?.includes("others") && formData.productGroup.length === 0) {
    //   errors.productGroup = 'productGroup is required';
    //   isValid = false;
    // }

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

          alert(response.data.message);
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
          alert(response.data.message);
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
    // setLoading(true);
    try {
      const response = await fetchUserRole(); // make sure this is imported correctly
      setUserRoleData(response.data);
    } catch (error) {
      console.error("Error fetching user roles", error);
    }
  };
  const getProductDetail = () => {
    getProduct()
      .then((response) => {
        setStoreProduct(response.data);
        console.log("product", response.data);
      })
  }


  useEffect(() => {
    fetchUserRoleData();
    getProductDetail()
  }, []);

  const [productGroup, setProductGroup] = useState([]);
  const [productName, setProductName] = useState([]);

  // 2. Fill state with unique ProductGroup values (run once, e.g., in useEffect)
  useEffect(() => {
    const uniqueGroups = [
      ...new Map(storeProduct.map(item => [item.productGroup, item])).values()
    ].map(item => item.productGroup); // just strings

    setProductGroup(uniqueGroups);
  }, [storeProduct]);

  useEffect(() => {
    const uniqueGroups = [
      ...new Map(storeProduct.map(item => [item.productName, item])).values()
    ].map(item => item.productName);

    setProductName(uniqueGroups);  // store in state
  }, [storeProduct]);

  console.log("productname", productName)

  return (
    <div className="cretaeBackgroundimgae">
      <div className="form-container">
        <div className="cretaeimgaeuyef"></div>
        {isEdit ? "Edit Account" : "Create Account"} 
<form onSubmit={isEdit ? handleUpdate : handleSubmit}>
          <div className="form-grid">
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
                {(formData.requestType?.includes("Submodule") || formData.requestType?.includes("others")) && (

                  <Autocomplete
                    multiple
                    options={productGroup} // array of strings
                    getOptionLabel={(option) => option || ""} // <-- important!
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
                    options={productName} // array of strings
                    getOptionLabel={(option) => option || ""} // <-- important!
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
                  />
                )}
              </ThemeProvider>

            </div>
{userRoleData.length > 0 && (
  <div className="form-field" style={{ width: '100%' }}>
    <FormLabel component="legend">User Role</FormLabel>
    <FormGroup row>
      {userRoleData.map((role) => (
        <FormControlLabel
          key={role}
          control={
            <Checkbox
              checked={formData.userRole.includes(role)}
              onChange={(e) => {
                const checked = e.target.checked;
                const updatedRoles = checked
                  ? [...formData.userRole, role]
                  : formData.userRole.filter((r) => r !== role);
                setFormData({ ...formData, userRole: updatedRoles });
              }}
            />
          }
          label={role}
        />
      ))}
    </FormGroup>
    {formErrors.userRole && <p style={{ color: 'red' }}>{formErrors.userRole}</p>}
  </div>
)}

            {/* <div className="form-field" style={{ width: '100%' }}>
              <FormLabel component="legend">User Role</FormLabel>
              <FormGroup row>
                {userRoleData.map((role) => (
                  <FormControlLabel
                    key={role}
                    control={
                      <Checkbox
                        checked={formData.userRole.includes(role)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const updatedRoles = checked
                            ? [...formData.userRole, role]
                            : formData.userRole.filter((r) => r !== role);
                          setFormData({ ...formData, userRole: updatedRoles });
                        }}
                      />
                    }
                    label={role}
                  />
                ))}
              </FormGroup>
              {formErrors.userRole && <p style={{ color: 'red' }}>{formErrors.userRole}</p>}
            </div> */}

            {formData.userRole.includes("Requester") && (
              <div className="form-field" style={{ width: '100%' }}>
                <FormLabel component="legend">Requester Type</FormLabel>
                <FormGroup row>
                  {[
                    "Material Request",
                    "Scrap Request",
                    "Stock Transfer Request",
                    "Material Request Projects"
                  ].map((reqType) => (
                    <FormControlLabel
                      key={reqType}
                      control={
                        <Checkbox
                          checked={formData.requesterType?.includes(reqType) || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentList = formData.requesterType || [];
                            const updated = checked
                              ? [...currentList, reqType]
                              : currentList.filter((r) => r !== reqType);
                            setFormData({ ...formData, requesterType: updated });
                          }}
                        />
                      }
                      label={reqType}
                    />
                  ))}
                </FormGroup>
                {formErrors.requesterType && <p style={{ color: 'red' }}>{formErrors.requesterType}</p>}
              </div>
            )}

            {formData.requesterType?.includes("Material Request") && (
              <div className="form-field" style={{ width: '100%' }}>
                <FormLabel component="legend">Request Type</FormLabel>
                <FormGroup row>
                  {["Submodule", "others","ThermalGel"].map((reqType) => (
                    <FormControlLabel
                      key={reqType}
                      control={
                        <Checkbox
                          checked={formData.requestType?.includes(reqType) || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const currentList = formData.requestType || [];
                            const updated = checked
                              ? [...currentList, reqType]
                              : currentList.filter((r) => r !== reqType);
                            setFormData({ ...formData, requestType: updated });
                          }}
                        />
                      }
                      label={reqType}
                    />
                  ))}
                </FormGroup>

                {formErrors.requestType && <p style={{ color: 'red' }}>{formErrors.requestType}</p>}

              </div>
            )}
            {(formData.requestType?.includes("Submodule") || formData.requestType?.includes("others")) && (

              <div className='ProductTexfiled'>
                <ThemeProvider theme={TextFiledTheme}>


                </ThemeProvider>
              </div>
            )}
          </div>
          <Button type="submit" variant="contained" color="primary"
            fullWidth
            style={{ marginTop: '20px' }}
          >
            {isEdit ? "Edit Account" : "Create Account"}
          </Button>
          {isEdit && (
  <Button
    variant="contained"
    color="secondary"
    style={{ marginTop: "20px" }}
    onClick={() => navigate("/userDetail")}
  >
    Cancel
  </Button>
)}


          <div style={{ marginTop: '10px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>
              Already have an account? Sign in
            </Link>
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
