import React, { useState } from 'react';
import './CreateAccount.css';
import {
  TextField,
  MenuItem,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { CreateAccountUser } from '../ServicesComponent/Services';

const CreateAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    userRole: [],
    requesterType:[],
    requestType:[],
    emailAddress: '',
    phoneNumber: '',
    password: '',
    createdBy: '',
    modifiedBy: '',
    adminPassword:''
  });

  const [formErrors, setFormErrors] = useState({});

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
    if (formData.requesterType.length === 0) {
        errors.requesterType = 'RequesterType is required';
        isValid = false;
      }
      if (formData.requestType.length === 0) {
        errors.requestType = 'RequesterType is required';
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
        .then((res) => {
          if (res.data) {
            alert("Account Created Successfully");
            navigate("/");
          } else if (res.status === 400) {
            alert("Invalid data");
          } else if (res.status === 409) {
            alert("UserId already exists");
          } else {
            alert("Account creation failed");
          }
        })
        .catch(() => {});

      setFormData({
        userId: '',
        userName: '',
        userRole: [],
        emailAddress: '',
        phoneNumber: '',
        password: '',
        requesterType:[],
        requestType:[],
        adminPassword:''
      });
    }
  };

  return (
    <div className="cretaeBackgroundimgae">
      <div className="form-container">
        <div className="cretaeimgae"></div>
        {/* <h5>Create Account</h5> */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
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
            </div>
            <div className="form-field">
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
            </div>
            <div className="form-field">
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
            </div>
            <div className="form-field">
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
            </div>
            <div className="form-field">
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(formErrors.password)}
                helperText={formErrors.password}
                fullWidth
                size="small"
              />
            </div>
            <div className="form-field">
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
            </div>
            <div className="form-field" style={{ width: '100%' }}>
  <FormLabel component="legend">User Role</FormLabel>
  <FormGroup row>
    {["Admin", "Manager", "Viewer", "Requester", "PTL Operator"].map((role) => (
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

{/* ✅ Conditionally show "Requester type" checkboxes if "Requester" is selected */}
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
      {["Submodule", "others"].map((reqType) => (
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


          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '20px' }}
          >
            Create Account
          </Button>

          <div style={{ marginTop: '10px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'blue' }}>
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount;
