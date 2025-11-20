import React, { useState, useEffect } from 'react';
import CreateAccount from "../UserAuthentication/CreateAccount/CreateAccount";
import { FaEdit } from "react-icons/fa";
import { fetchPTLBoard, fetchRoleScreen, fetchUserDetail, savePTLSubmit, saveRole, saveScreenAsign, updateRole } from '../../Services/Services_09';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns'; // make sure this import is correct
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../components/Com_Component/LoadingOverlay";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
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
    const [loading, setLoading] = useState(false);

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

    // const handleEditClick = (row) => {
    //     // Safely decode password if it is a string
    //     const decodedPwd = typeof row.password === 'string' ? atob(row.password) : '';

    //     // Convert comma-separated strings to arrays only if they are strings
    //     const toArray = (val) => (typeof val === 'string' ? val.split(',') : Array.isArray(val) ? val : []);

    //     // Prepare form data
    //     const formData = {
    //         ...row,
    //         password: decodedPwd,
    //         userRole: toArray(row.userRole),
    //         requesterType: toArray(row.requesterType),
    //         requestType: toArray(row.requestType),
    //         productGroup: toArray(row.productGroup),
    //         productname: toArray(row.productname),
    //     };

    //     setEditFormData(formData);
    //     navigate("/createAccount", { state: { formData, isEdit: true } });
    // };

    const handleEditClick = (row) => {
        const decodedPwd = typeof row.password === 'string' ? atob(row.password) : '';

        const toArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.includes(",") ? val.split(",") : [val];
            return [];
        };

        const formData = {
            ...row,
            password: decodedPwd,
            userRole: toArray(row.userRole),
            requesterType: toArray(row.requesterType),
            requestType: toArray(row.requestType),
            productGroup: toArray(row.productGroup),
            productname: toArray(row.productname).map(p => ({ label: p, value: p })), // 👈 map to object
        };

        setEditFormData(formData);
        console.log("Editing row data being sent:", {
            ...formData,
            productname: formData.productname
        });

        navigate("/createAccount", { state: { formData, isEdit: true } });
    };




    const exportToExcel = (searchText = "") => {
        if (!Array.isArray(roleAndScreen) || roleAndScreen.length === 0) return;

        // Filter data if search text is provided
        const filteredData = searchText.trim()
            ? roleAndScreen.filter(item =>
                item.userName.toLowerCase().includes(searchText.toLowerCase()) ||
                item.userId.toLowerCase().includes(searchText.toLowerCase()) ||
                item.emailAddress.toLowerCase().includes(searchText.toLowerCase()) ||
                item.phoneNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                item.productname.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
                item.productGroup.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
                item.requestType.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
                item.requesterType.join(", ").toLowerCase().includes(searchText.toLowerCase())
            )
            : roleAndScreen;

        if (filteredData.length === 0) return;

        // Flatten array fields
        const formattedData = filteredData.map(item => ({
            // id: item.id,
            userId: item.userId,
            userName: item.userName,
            emailAddress: item.emailAddress,
            phoneNumber: item.phoneNumber,
            userRole: item.userRole.join(", "),
            requestType: item.requestType.join(", "),
            productGroup: item.productGroup.join(", "),
            requesterType: item.requesterType.join(", "),
            productname: item.productname.join(", "),
            userRole: item.userRole.join(",")
        }));

        const sheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, "UserList");
        XLSX.writeFile(workbook, "UserList.xlsx");
    };

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
    //                 productname: (row) => (row.productname ? row.productname.join(", ") : ""),
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
                        <button className="edit-button" style={{ marginLeft: '10px' }} onClick={() => handleEditClick(row)}>
                            <FaEdit />
                        </button>
                    ),
                    // render arrays with each value on a new line
                    productname: (row) => (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {row.productname ? row.productname.join("\n") : ""}
                        </div>
                    ),
                    productGroup: (row) => (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {row.productGroup ? row.productGroup.join("\n") : ""}
                        </div>
                    ),
                    requestType: (row) => (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {row.requestType ? row.requestType.join("\n") : ""}
                        </div>
                    ),
                    requesterType: (row) => (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {row.requesterType ? row.requesterType.join("\n") : ""}
                        </div>
                    ),
                    userRole: (row) => (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {row.userRole ? row.userRole.join("\n") : ""}
                        </div>
                    ),
                },
            }),
        [fields, customConfig, handleEditClick]
    );

    useEffect(() => {
        fetchUser();

    }, []);
    // Memoized filtered data
    const filteredRoleAndScreen = React.useMemo(() => {
        if (!searchText.trim()) return roleAndScreen;

        return roleAndScreen.filter(item =>
            item.userName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.userId.toLowerCase().includes(searchText.toLowerCase()) ||
            item.emailAddress.toLowerCase().includes(searchText.toLowerCase()) ||
            item.phoneNumber.toLowerCase().includes(searchText.toLowerCase()) ||
            item.productname.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
            item.productGroup.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
            item.requestType.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
            item.requesterType.join(", ").toLowerCase().includes(searchText.toLowerCase()) ||
            item.userRole.join(", ").toLowerCase().includes(searchText.toLowerCase())

        );
    }, [roleAndScreen, searchText]);

    // Paginate the filtered data
    const paginatedData = React.useMemo(() => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredRoleAndScreen.slice(startIndex, endIndex);
    }, [filteredRoleAndScreen, page, perPage]);


    const fetchUser = async () => {
        setLoading(true)
        try {
            const response = await fetchUserDetail(); // your API call
            setRoleAndScreenName(response.data);
            setTotalRows(response.data.length);

        } catch (error) {
            console.error("Error fetching user roles", error);
        } finally { setLoading(false) }
    };
    // console.log("roleAndScreen", roleAndScreen)

    return (
        <div className='ComCssTable'>
            <h5 className='ComCssTableName'>User Detail</h5>
            <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                <button className="btn btn-success" onClick={() => exportToExcel(searchText)}  >
                    <FaFileExcel /> Export
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
            </div>
            <LoadingOverlay loading={loading} />

            <CommonDataTable
                columns={columns}
                data={paginatedData}
                page={page}
                perPage={perPage}
                totalRows={filteredRoleAndScreen.length}
                loading={loading}
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