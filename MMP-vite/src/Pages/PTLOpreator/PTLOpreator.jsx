import React, { useState, useEffect } from 'react';
import PTLOpreatoreTable from "../../components/PTLOpreator/PTLOpreatoreTable";

import { FaFileExcel } from "react-icons/fa";
import CustomDialog from "../../components/Com_Component/CustomDialog";
import { commonHandleAction, handleSuccessCommon, handleErrorCommon } from "../../components/Com_Component/commonHandleAction ";
import { ThemeProvider } from '@mui/material/styles';
import ComTextFiled from '../../components/Com_Component/ComTextFiled'; // adjust path if needed
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme'; // adjust path if needed
import { Autocomplete, TextField } from "@mui/material";
import { fetchPTLBoard } from '../../Services/Services_09';

const PTLOpreator = () => {
    const [formData, setFormData] = useState({
        boardserialnumber: "", id: "", pickingqty: ""
    })
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [submitButton, setSubmitButton] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pickButton, setpickButton] = useState(true);

    useEffect(() => {
        fetchData(); // call immediately on mount

        const intervalId = setInterval(() => {
            fetchData(); // call every 15 seconds
        }, 15000); // 15000 ms = 15 seconds

        return () => clearInterval(intervalId); // cleanup on unmount
    }, []);


    const fetchData = async () => {
        try {
            const response = await fetchPTLBoard();
            if (response.status === 200) {
                const modifiedData = response.data.map((item, idx) => ({
                    ...item,
                    selectedid: item.selectedid ?? idx, // fallback index as unique id
                    RequestedQty: item.pickingqty || 0
                }));
                setTableData(modifiedData);
            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    console.log("tableData", tableData);
    const boardSerialOprion = Array.isArray(tableData)
        ? [...new Set(tableData.map(i => i.boardserialnumber))]
            .filter(Boolean)
            .map(val => ({ label: val, value: val }))
        : [];

    const filteredData = tableData.filter(
        (item) => item.boardserialnumber === formData.boardserialnumber
    );

    const handleQtyChange = (id, value) => {
        const updatedData = tableData.map(item =>
            item.selectedid === id ? { ...item, pickingqty: value } : item
        );
        setTableData(updatedData);
    };

    console.log("filteredData", filteredData);
    useEffect(() => {
        if (formData.boardserialnumber) {
            setShowTable(true);
        } else {
            setShowTable(false);
        }
    }, [formData.boardserialnumber]);


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>PTLOpreator</p>
                </div>
                {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-67px' }}>
                    <p style={{ marginRight: "90px" }}>Request: {5}</p>
                </div> */}
                <div className="ComCssTexfiled">
                    <ThemeProvider theme={TextFiledTheme}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Autocomplete
                                sx={{ width: 280 }}
                                options={boardSerialOprion}
                                getOptionLabel={(option) => option.label || ""}
                                value={boardSerialOprion.find(opt => opt.value === formData.boardserialnumber) || null}
                                onChange={(e, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        boardserialnumber: newValue ? newValue.value : ""
                                    }));
                                    setShowTable(!!newValue); // 👈 this line toggles table visibility
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Product Name"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />


                            <ComTextFiled
                                name="SUINo"
                                value={boardSerialOprion.length}
                                sx={{ width: 80 }}
                            />
                        </div>
                    </ThemeProvider>
                </div>

            </div>
            {showTable && (
                <div className='ComCssTable'>


                    <PTLOpreatoreTable
                        data={filteredData}
                        page={0}
                        perPage={10}
                        totalRows={filteredData.length}
                        loading={false}
                        handleQtyChange={handleQtyChange}
                        setPage={() => { }}
                        setPerPage={() => { }}
                        pickButton={pickButton}
                        setpickButton={setpickButton}
                    />


                </div>
            )}
        </div>
    )
}

export default PTLOpreator