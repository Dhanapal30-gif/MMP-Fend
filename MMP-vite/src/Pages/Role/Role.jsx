import React, { useState, useEffect } from 'react';
import PTLOpreatoreTable from "../../components/PTLOpreator/PTLOpreatoreTable";
import { FaEdit } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../../components/Com_Component/ComTextFiled'; // adjust path if needed
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme'; // adjust path if needed
import { Autocomplete, TextField } from "@mui/material";
import { fetchPTLBoard, fetchRoleScreen, savePTLSubmit, saveRole, saveScreenAsign, updateRole } from '../../Services/Services_09';
import "./RoleM.css"
import { tr } from 'date-fns/locale';
import { fetchScreenName, fetchUserRole } from '../../Services/Services';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns'; // make sure this import is correct

const Role = () => {


    const [formData, setFormData] = useState({
        userrole: "",
    })
    const [formData7, setFormData7] = useState({
        asignUserrole: "",
        screenNameSelect: ""
    })
    const [formErrors, setFormErrors] = useState({});
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [roleCreation, setAoleCreation] = useState(false);
    const [assignScreen, setAssignScreen] = useState(true);
    const [addRole, setAddRole] = useState(true)
    const [submitButton, setSubmitButton] = useState(true)
    const [userRoleData, setUserRoleData] = useState([]);
    const [screenName, setScreenName] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roleData, setRoleData] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(20);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [roleAndScreen, setRoleAndScreenName] = useState([]);
    const [updateButton,setUpdateButton]=useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };



    const valiDate = () => {
    const errors = {};
    let isValid = true;

    // Validate main role
    if (!formData7.asignUserrole) {
        errors.userrole = "Please Enter userrole";
        isValid = false;
    }

    // Validate screen assignment
    if (assignScreen) {
        if (!formData7.screenNameSelect || formData7.screenNameSelect.length === 0) {
            errors.screenNameSelect = "Please Enter screenName";
            isValid = false;
        }

        if (!formData7.asignUserrole) {
            errors.asignUserrole = "Please Enter userrole";
            isValid = false;
        }
    }

    setFormErrors(errors);
    return isValid;
};

 const creationvaliDate = () => {
    const errors = {};
    let isValid = true;

    if(!formData.userrole ){
        errors.userrole = "Please Enter userrole";
        isValid = false;
    }
    setFormErrors(errors);
    return isValid;
};



    const handleCreate = async () => {
        if (!creationvaliDate()) return;
        const createdby = sessionStorage.getItem("userName") || "System";
        console.log(formData)
        const updatedFormData = { ...formData, createdby };

        try {
            const response = await saveRole(updatedFormData);
            setSuccessMessage("Product Updated Successfully");
            setShowSuccessPopup(true);
            setFormData({
                userrole: "",
            });

        setAddRole(false);
        fetchUserRoleData();
            // Refresh table
            // fetchProduct(1, perPage); // reset to first page
            // setPage(1);
        } catch (error) {
            if (error.response) {
                const message =
                    error.response.status === 409
                        ? "Product already exists"
                        : "Something went wrong";
                setErrorMessage(message);
            } else {
                setErrorMessage("Network error, please try again");
            }
            setShowErrorPopup(true);
        }

    }

    const fetchUserRoleData = async () => {
        setLoading(true);
        try {
            const response = await fetchUserRole(); // make sure this is imported correctly
            setUserRoleData(response.data);
        } catch (error) {
            console.error("Error fetching user roles", error);
        } finally {
            setLoading(false);
        }
    };
    const fetchScreen = async () => {
        setLoading(true);
        try {
            const response = await fetchScreenName(); // make sure this is imported correctly
            setScreenName(response.data);
        } catch (error) {
            console.error("Error fetching user roles", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoleAndScreen = async () => {
        try {
            const response = await fetchRoleScreen(); // your API call
            if (response && response.data) {
                const tableData = (response.data?.data || []).map(item => ({
                    userrole: item.userrole || "-",
                    screenName: (item.screenNameSelect || []).join(", ") || "-"
                }));
                setRoleAndScreenName(tableData);
                setTotalRows(tableData.length);
            } else {
                setRoleAndScreenName([]);
                setTotalRows(0);
            }
        } catch (error) {
            console.error("Error fetching user roles", error);
        }
    };
    console.log("roleAndScreen", roleAndScreen)

    useEffect(() => {
        fetchUserRoleData();
        fetchScreen();
        fetchRoleAndScreen();
    }, []);

    const handleRole = () => {
        setAoleCreation(true)
        setAssignScreen(false)
        setAddRole(false);
        setSubmitButton(false);

    }
    const clear = () => {
        setAoleCreation(false)
        setAssignScreen(true)
        setAddRole(true);
        setSubmitButton(true)
        setUpdateButton(false)
        setFormErrors("")
        setFormData7({
            userrole: "",
            screenNameSelect: ""
        })
        setFormData({
            userrole: "",
        })
    }
    const handleSubmit = async () => {
            if (!valiDate()) return; // ✅ validate first

        console.log("formdaata7", formData7);
        const createdby = sessionStorage.getItem("userName") || "System";

        const updatedFormData = {
            ...formData7,
            createdby,
            userrole: formData7.asignUserrole
        };

        try {
            const response = await saveScreenAsign(updatedFormData);
            setSuccessMessage(response.data.message );
            setShowSuccessPopup(true);
await fetchRoleAndScreen();

            setFormData({
                userrole: "",
            });
            setFormData7({
            userrole: "",
            screenNameSelect: ""
        })

        } catch (error) {
            if (error.response) {
                const message =
                    error.response.status === 409
                        ? "Product already exists"
                        : "Something went wrong";
                setErrorMessage(message);
            } else {
                setErrorMessage("Network error, please try again");
            }
            setShowErrorPopup(true);
        }
    };


    const fields = [
        "edit",
        "userrole",
        "screenName",

    ];
    const handleEditClick = (row) => {
        setSubmitButton(false);
        setAddRole(false);
        setUpdateButton(true)
        setFormData7({
            asignUserrole: row.userrole,
            screenNameSelect: Array.isArray(row.screenName)
                ? row.screenName
                : (row.screenName ? row.screenName.split(",") : []), // 👈 use split to make array
        });
    };

    const customConfig = {
        userrole: { label: "User Role", width: "120px" },
        screenName: {
            label: "Screen Name",
            width: "300px",
            wrap: true,
            style: { whiteSpace: "pre-line" }
        },
    };

    const columns = React.useMemo(
  () =>
    generateColumns({
      fields,
      customConfig,
      customCellRenderers: {
        edit: (row) => (
          <button className="edit-button" onClick={() => handleEditClick(row)}>
            <FaEdit />
          </button>
        ),
        screenNameSelect: (row) => (
          <div>
            {row.screenNameSelect?.map((screen, i) => (
              <div key={i}>{screen}</div>
            ))}
          </div>
        ),
      },
    }),
  [fields, customConfig, handleEditClick]
);


    const handleUpdate = () => {
        //    if (!valiDate()) return;
        setLoading(true);
        const modifiedby = sessionStorage.getItem('userName') || "System";
        const updateFormData = {
            ...formData7,
            userrole: formData7.asignUserrole,

            modifiedby
        };

        updateRole(updateFormData)
            .then((response) => {
                setSuccessMessage(response.data.message);
                setShowSuccessPopup(true);

            }).catch((error) => {
                setLoading(false);
                if (error.response) {
                    if (error.response.status === 409) {
                        setErrorMessage(error.response.data.message);
                        setShowErrorPopup(true);
                    }
                } else {
                    setErrorMessage("Network error, please try again");
                    setShowErrorPopup(true);
                }
            }).finally(() => {
                setLoading(false);
            });
    }

    
    return (
        <div className='COMCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <h5>RoleMaster</h5>

                </div>
                <div className='ProductTexfiled'>

                    <ThemeProvider theme={TextFiledTheme}>
                        {roleCreation &&
                            <TextField
                                id="outlined-basic"
                                label="User Role"
                                variant="outlined"
                                name="userrole"
                                value={formData.userrole}
                                onChange={handleChange}
                                error={Boolean(formErrors.userrole)}
                                helperText={formErrors.userrole}
                                size="small"
                            />
                        }
                        {assignScreen &&
                            <Autocomplete
                                options={userRoleData}
                                getOptionLabel={(option) => option}
                                value={formData7.asignUserrole || null}
                                onChange={(event, newValue) =>
                                    setFormData7((prev) => ({ ...prev, asignUserrole: newValue || null }))
                                }
                                // disableClearable={false}
                                // clearOnEscape
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="userrole"
                                        name="asignUserrole"
                                        error={Boolean(formErrors.asignUserrole)}
                                        helperText={formErrors.asignUserrole}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />



                        }
                        {assignScreen &&
                            <Autocomplete
                                multiple
                                options={screenName}
                                getOptionLabel={(option) => option}
                                value={formData7.screenNameSelect || []}
                                onChange={(event, newValue) =>
                                    setFormData7({ ...formData7, screenNameSelect: newValue || [] })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="screenName"
                                        variant="outlined"
                                        error={Boolean(formErrors.screenNameSelect)}
                                        helperText={formErrors.screenNameSelect}
                                        size="small"
                                    />
                                )}
                            />

                        }
                    </ThemeProvider>
                    <div className='ComCssButton9'>

                        {addRole && <button style={{ backgroundColor: 'orange', marginTop: "-50px" }} onClick={handleRole} > Addrole</button>}

                    </div>
                </div>
                <div className='ComCssButton9'>
                    {roleCreation && <button style={{ backgroundColor: 'green' }} onClick={handleCreate} >Create</button>}
                    <button style={{ backgroundColor: 'blue' }} onClick={clear} >Clear</button>
                    {submitButton && <button style={{ backgroundColor: 'green' }} onClick={handleSubmit}>Submit</button>}
                    {/* {handleUpdateButton && <button style={{ backgroundColor: 'orange' }} onClick={(e) => handleUpdate(e, formData.id)}>Update</button>} */}
                   {updateButton && <button style={{ backgroundColor: 'orange' }} onClick={handleUpdate}>Update</button> }

                    {/* <button style={{ backgroundColor: 'green' }} onClick={handleRole} >Add role</button> */}

                </div>
            </div>
            <div className='ComCssTable'>
                <h5 className='ComCssTableName'>Roles & Screens</h5>
                {/* <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                                <button className="btn btn-success" onClick={() => exportToExcel(searchText)} disabled={loading}>
                                    {loading
                                        ? downloadProgress !== null
                                            ? `Downloading... ${downloadProgress}%`
                                            : "Downloading..."
                                        : downloadDone
                                            ? "✅ Done"
                                            : (
                                                <>
                                                    <FaFileExcel /> Export
                                                </>
                                            )}
                                </button>
                                <div style={{ position: "relative", display: "inline-block", width: "200px" }}>
                                    <input type="text" className="form-control" style={{ height: "30px", paddingRight: "30px" }} placeholder="Search..." value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    {searchText && (
                                        <span
                                            onClick={() => setSearchText("")}
                                            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#aaa", fontWeight: "bold" }} >
                                            ✖
                                        </span>
                                    )}
                                </div>
                            </div> */}
                            
                <CommonDataTable
                    columns={columns}
                    data={roleAndScreen}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    loading={loading}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                />
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


    )
}

export default Role