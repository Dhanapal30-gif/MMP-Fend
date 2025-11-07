import React, { useState, useEffect } from 'react';
import CreateAccount from "../UserAuthentication/CreateAccount/CreateAccount";
import { FaEdit } from "react-icons/fa";
import { fetchPTLBoard, fetchRoleScreen, fetchUserDetail, savePTLSubmit, saveRole, saveScreenAsign, updateRole } from '../../Services/Services_09';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns'; // make sure this import is correct
import { useNavigate } from "react-router-dom";

const UserDetail = () => {

    const [editFormdata, setEditFormData] = useState({
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

    const [roleAndScreen, setRoleAndScreenName] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [onEdit, setOnEdit] = useState(false)
    const fields = [
        "User_Edit",
        "userId",
        "userName",
        "userRole",
        "emailAddress",
        "password",
        "phoneNumber",
        "productname",
        "productGroup",
        "requestType",
        "requesterType",
    ];
    const navigate = useNavigate();

    const customConfig = {

        userId: { label: "USERID", width: "120px" },
        userName: { label: "User Name", width: "120px" },
        userRole: { label: "User Role", width: "120px" },
        emailAddress: { label: "Email Address", width: "120px" },
        password: { label: "Password", width: "120px" },
        phoneNumber: { label: "Phone Number", width: "120px" },
        productname: { label: "Product Name", width: "120px" },
        productGroup: { label: "Product Group", width: "120px" },
        requestType: { label: "Request Type", width: "120px" },
        requesterType: { label: "Requester Type", width: "120px" },

        screenName: {
            label: "Screen Name",
            width: "300px",
            wrap: true,
            style: { whiteSpace: "pre-line" }
        },
    };

    // const decodePassword = (encoded) => {
    //     if (!encoded) return "";
    //     try {
    //         return atob(encoded); // base64 decode
    //     } catch (e) {
    //         console.error("Decode failed:", e);
    //         return encoded; // fallback
    //     }
    // };



    const decodePassword = (encoded) => {
    if (!encoded) return "";
    try {
        return atob(encoded);
    } catch {
        return encoded; // fallback
    }
};

const handleEditClick = (row) => {
    // Safely decode password if it is a string
    const decodedPwd = typeof row.password === 'string' ? atob(row.password) : '';

    // Convert comma-separated strings to arrays only if they are strings
    const toArray = (val) => (typeof val === 'string' ? val.split(',') : Array.isArray(val) ? val : []);

    // Prepare form data
    const formData = {
        ...row,
        password: decodedPwd,
        userRole: toArray(row.userRole),
        requesterType: toArray(row.requesterType),
        requestType: toArray(row.requestType),
        productGroup: toArray(row.productGroup),
        productname: toArray(row.productname),
    };

    setEditFormData(formData);
    navigate("/createAccount", { state: { formData, isEdit: true } });
};

    // const handleEditClick = (row) => {
    //      const decodedPwd = decodePassword(row.password);
    // // const decodedPwd = row.password ? atob(row.password) : "";

    //     navigate("/createAccount", { state: { formData: row, isEdit: true } });
    //     setEditFormData({
    //         userId: row.userId,
    //         userName: row.userName,
    //         emailAddress: row.emailAddress,
    //         phoneNumber: row.phoneNumber,
    //     password: decodePassword(row.password), // safely decode
    //         userRole: row.userRole,

    //         userRole: Array.isArray(row.userRole)
    //             ? row.userRole
    //             : (row.userRole ? row.userRole.split(",") : []), // 👈 use split to make array

    //         requesterType: Array.isArray(row.requesterType)
    //             ? row.requesterType
    //             : (row.requesterType ? row.requesterType.split(",") : []),

    //         requestType: Array.isArray(row.requestType)
    //             ? row.requestType
    //             : (row.requestType ? row.requestType.split(",") : []),

    //         productGroup: Array.isArray(row.productGroup)
    //             ? row.productGroup
    //             : (row.productGroup ? row.productGroup.split(",") : []),

    //         productname: Array.isArray(row.productname)
    //             ? row.productname
    //             : (row.productname ? row.productname.split(",") : []),
    //     });
    // };

    console.log("fromData", editFormdata)
    // const columns = React.useMemo(
    //     () =>
    //         generateColumns({
    //             fields,
    //             customConfig,
    //             customCellRenderers: {
    //                 User_Edit: (row) => (
    //                     <button className="edit-button" onClick={() => handleEditClick(row)}>
    //                         <FaEdit />
    //                     </button>
    //                 ),
    //             },
    //         }),
    //     [fields, customConfig, handleEditClick]
    // );

const columns = React.useMemo(
  () =>
    generateColumns({
      fields,
      customConfig,
      customCellRenderers: {
        User_Edit: (row) => (
          <button className="edit-button" onClick={() => handleEditClick(row)}>
            <FaEdit />
          </button>
        ),
        productname: (row) => (row.productname ? row.productname.join(", ") : ""),
      },
    }),
  [fields, customConfig, handleEditClick]
);

    useEffect(() => {
        fetchUser();

    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetchUserDetail(); // your API call
            setRoleAndScreenName(response.data);
            setTotalRows(response.data.length);

        } catch (error) {
            console.error("Error fetching user roles", error);
        }
    };
    console.log("roleAndScreen", roleAndScreen)

    return (
        <div className='ComCssTable'>
            <h5 className='ComCssTableName'>User Detail</h5>
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
                // loading={loading}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
            />

            {/* <CreateAccount
                editFormdata={editFormdata}
                setEditFormData={setEditFormData}
            /> */}
        </div>

    )
}

export default UserDetail