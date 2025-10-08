import React, { useState, useEffect } from 'react'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../../components/Com_Component/TextFiledTheme';
import "./Receving.css";
import { fetchPoNumberData, fetchPoDeatil, fetchReceving, fetchfind, fetchRecevingData, download } from '../../components/Receving/ReceivingActions';
import { RecevingTextFiled, RecevingTextFiled2, RecevingTextFiled3, RecevingTextFiled4, RecevingTextFiled5, RecevingTextFiled6, RecevingTextFiled7, RecevingTextFiled8, RecevingTextFiled9, RecevingTextFiled17 } from '../../components/Receving/RecevingTextFiled'; // ✅ no curly braces
import { deleteRecDetail, downloadRecevingDetail, fetchPoDetail, recevingDetail, updateRecDeatil } from '../../Services/Services_09';
import { RecevingTable, ColumnTable } from '../../components/Receving/RecevingTable';
import { GlobalStyles } from '@mui/material';
import CustomDialog from "../../components/Com_Component/CustomDialog";
import * as XLSX from "xlsx";

import { FaFileExcel } from "react-icons/fa";

const Receving = () => {
  const [ponumber, setPonumber] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showRecevingTable, setShowRecevingTable] = useState(false);
  const [poDetail, setPoDetail] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [recevingData, setRecevingData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [recTicketNo, setRecTicketNo] = useState("");
  const [submitButton, setSubmitButton] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [updateButton, setUpdateButton] = useState(false);
  const [deleteButton, setDeleteButton] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedDeleteRows, setSelectedDeleteRows] = useState([]);
  const [formData, setFormData] = useState({
    ponumber: "", vendorname: "", currency: "", postingdate: "", rcBactchCode: "",
    invoiceNo: "", invoiceDate: "", receivingDate: ""
  })

  const handleFieldChange = (index, field, value) => {
    setPoDetail((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            [field]: value,
          }
          : item
      )
    );
  };

//receving ticket no fetching
  // useEffect(() => {
  //   fetchRecevingData((ticketNo) => {
  //     setRecTicketNo(ticketNo);
  //     setFormData((prev) => ({
  //       ...prev,
  //       recevingTicketNo: ticketNo, // ✅ Set into formData directly
  //     }));
  //   });
  // }, []);


  const valiDate = () => {
    const errors = {};
    let isValid = true;

    if (!formData.invoiceNo) {
      errors.invoiceNo = "Please Enter invoiceNo";
      isValid = false;
    }
    if (!formData.invoiceDate) {
      errors.invoiceDate = "Please Enter invoiceDate";
      isValid = false;
    }
    if (!formData.receivingDate) {
      errors.receivingDate = "Please Enter receivingDate";
      isValid = false;
    }
    // Validate only selected rows
    const selectedKeys = new Set(selectedRows);
    const filteredDetail = poDetail.filter(
      (row) => selectedKeys.has(`${row.ponumber}-${row.partcode}`)
    );
    filteredDetail.forEach((row, index) => {
      if (!row.recevingQty) {
        errors[`recevingQty-${index}`] = "Please Enter RecevingQty";
        isValid = false;
      }
      if (!row.totalValue) {
        errors[`totalValue-${index}`] = "Please Enter TotalValue";
        isValid = false;
      }
      if (!row.exp_date) {
        if (!row.expdateapplicable === "yes") {
          errors[`exp_date-${index}`] = "Please Enter Expiry Date";
          isValid = false;

        }
      }
    });
    setFormErrors(errors);
    return isValid;
  };

  useEffect(() => {
    fetchPoNumberData(setPonumber);
  }, [])


  const commonFileds = {
    ponumber: formData.ponumber,
    postingdate: formData.postingdate,
    vendorname: formData.vendorname,
    currency: formData.currency,
    ccf: formData.ccf,
    rcBactchCode: formData.rcBactchCode,
    invoiceNo: formData.invoiceNo,
    invoiceDate: formData.invoiceDate,
    receivingDate: formData.receivingDate
  };

  const finalData = poDetail.map(row => ({
    partcode: row.partcode,
    recevingQty: row.recevingQty,
    totalValue: row.totalValue,
    totalValueEuro: row.totalValueEuro,
    exp_date: row.exp_date ? `${row.exp_date} 00:00:00.000` : null,
    recevingTicketNo: formData.recevingTicketNo,
    ponumber: formData.ponumber,
    vendorname: formData.vendorname,
    rcBactchCode: formData.rcBactchCode,
    invoiceNo: formData.invoiceNo,
    invoiceDate: formData.invoiceDate,
    postingdate: formData.postingdate ? `${formData.postingdate} 00:00:00.000` : null,
    receivingDate: formData.receivingDate ? `${formData.receivingDate} 00:00:00.000` : null,
    invoiceDate: formData.invoiceDate ? `${formData.invoiceDate} 00:00:00.000` : null,
  }));


  // const handleAction = (e) => {
  //   e.preventDefault();

  //   if (!valiDate()) return;

  //   if (selectedRows.length === 0) {
  //     setErrorMessage("Please select at least one item before submitting.");
  //     setShowErrorPopup(true);
  //     return;
  //   }

  //   const selectedKeys = new Set(selectedRows); // selectedRows = ["P001-IT01", "P001-IT02"]
  //   const filteredData = finalData.filter((row) =>
  //     selectedKeys.has(`${row.ponumber}-${row.partcode}`)
  //   );

  //   if (filteredData.length === 0) {
  //     setErrorMessage("Selected data not matching.");
  //     setShowErrorPopup(true);
  //     return;
  //   }

  //   const username = sessionStorage.getItem("userName") || "System";
  //   const updatedFormData = filteredData.map((row) => ({
  //     ...row,
  //     createdby: username,
  //     updatedby: username,
  //   }));


  //   const updatedYTFormData = handleEdit.map((row) => ({
  //     ...row,
  //     updatedby: username,
  //   }));

  //   //  Choose correct API based on button type
  //   const apiCall = submitButton
  //     ? recevingDetail
  //     : updateButton
  //     ? updateRecDeatil
  //     : null;

  //   if (!apiCall) {
  //     setErrorMessage("No action specified (Submit or Update).");
  //     setShowErrorPopup(true);
  //     return;
  //   }

  //   apiCall(updatedFormData, updatedYTFormData)
  //     .then((response) => {
  //       setSuccessMessage(response.data.message);
  //       setShowSuccessPopup(true);
  //       setShowRecevingTable(false);
  //       setPoDetail([]);
  //       setFormData({});

  //       // ✅ Regenerate new ticket after save
  //       fetchRecevingData((ticketNo) => {
  //         setRecTicketNo(ticketNo);
  //         setFormData((prev) => ({
  //           ...prev,
  //           recevingTicketNo: ticketNo,
  //         }));
  //       });
  //     })
  //     .catch((error) => {
  //       const message =
  //         error?.response?.data?.message || "Network error, please try again";
  //       setErrorMessage(message);
  //       setShowErrorPopup(true);
  //     });
  // };
  const handleAction = (e) => {
    e.preventDefault();

    if (!valiDate()) return;

    if (selectedRows.length === 0) {
      setErrorMessage("Please select at least one item before submitting.");
      setShowErrorPopup(true);
      return;
    }

    const selectedKeys = new Set(selectedRows);
    const filteredData = finalData.filter((row) =>
      selectedKeys.has(`${row.ponumber}-${row.partcode}`)
    );

    const username = sessionStorage.getItem("userName") || "System";

    if (submitButton) {
      setLoading(true);

      setShowErrorPopup(false);
      setShowSuccessPopup(false);
      // const submitData = filteredData.map((row) => ({
      //   ...row,
      //   createdby: username,
      //   updatedby: username,
      // }));
      const submitData = filteredData.map((row) => ({
        ...row,
        // recevingTicketNo: formData.recevingTicketNo, // ✅ important
        createdby: username,
        updatedby: username,
      }));
      recevingDetail(submitData)
        .then(handleSuccess)
        .catch(handleError);
    } else if (updateButton) {
      setShowErrorPopup(false);
      setShowSuccessPopup(false);
      // Merge formData + poDetail[0] into single object
      const mergedData = {
        ...formData,
        invoiceDate: formData.invoiceDate ? `${formData.invoiceDate} 00:00:00.000` : null,
        postingdate: formData.postingdate ? `${formData.postingdate} 00:00:00.000` : null,
        ...poDetail[0],
        updatedby: username,
      };

      const id = formData.id;
      setLoading(true);

      updateRecDeatil(id, mergedData)
        .then(handleSuccess)
        .catch(handleError);
    }
    else {
      setErrorMessage("No action specified (Submit or Update).");
      setShowErrorPopup(true);
    }
  };


  const handleSuccess = (response) => {
    setLoading(false);  // <--- Stop loader here

    setSuccessMessage(response.data.message);
    setShowSuccessPopup(true);
    setShowErrorPopup(false);

    setShowRecevingTable(false);
    setPoDetail([]);
    setFormData({});
    setUpdateButton(false);
    setSubmitButton(true);
    setDeleteButton(false);
    setSelectedDeleteRows([]);
    setSelectedRows([]);
    fetchFindData(page, perPage, searchText);
    // ✅ Remove or replace this
    // finalData(); ← this is the source of the error

    fetchRecevingData((ticketNo) => {
      setRecTicketNo(ticketNo);
      setFormData((prev) => ({
        ...prev,
        recevingTicketNo: ticketNo,
      }));
    });
  };


  const handleError = (error) => {
    setLoading(false);  // <--- Stop loader here

    const message =
      error?.response?.data?.message || "Network error, please try again";
    setErrorMessage(message);
    setShowErrorPopup(true);
  };


  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  const debouncedSearch = useDebounce(searchText, 500); // delay in ms


  useEffect(() => {
    fetchFindData(page, perPage, debouncedSearch);
  }, [page, perPage, debouncedSearch])


  const fetchFindData = async (page = 1, size = 10, search = "") => {
    setLoading(true); // loader start
    try {
      if (search && search.trim() !== "") {
        await fetchfind(setRecevingData, setTotalRows, page, size, search);
      } else {
        await fetchReceving(setRecevingData, setTotalRows, page, size);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // loader end
    }
  };
  const formatToDateTime = (dateStr) => {
    return dateStr ? `${dateStr}T00:00:00` : null;
  };


  const exportToExcel = (search = "") => {
    download(search)
  }

  const formClear = () => {
    // finalData({ponumber:""})
    setFormData("");
    setShowRecevingTable(false);
    setSearchText("");
    // setSelectedRows("")
    setSelectedDeleteRows([])
    setDeleteButton(false)
  }



  const handleEdit = (rowData) => {
    setShowRecevingTable(true);
    setSubmitButton(false);
    setUpdateButton(true);

    setFormData({
      id: rowData.id || "",
      ponumber: rowData.ponumber,
      vendorname: rowData.vendorname,
      postingdate: rowData.postingdate,
      currency: rowData.currency,
      ccf: rowData.ccf,
      invoiceNo: rowData.invoiceNo,
      invoiceDate: rowData.invoiceDate?.substring(0, 10) || "",
      //receivingDate: rowData.receivingDate,
      rcBactchCode: rowData.rcBactchCode,
      receivingDate: rowData.receivingDate ? `${rowData.receivingDate} 00:00:00.000` : null,
      //invoiceDate: rowData.invoiceDate,
    });

    const combinedRow = {
      partcode: rowData.partcode,
      partdescription: rowData.partdescription,
      orderqty: rowData.orderqty || "",
      openOrderQty: rowData.orderqty - rowData.recevingQty || "",
      UOM: rowData.UOM || "",
      tyc: rowData.TYC,
      recevingQty: rowData.recevingQty,
      totalValue: rowData.totalValue,
      totalValueEuro: rowData.totalValueEuro,
      // exp_date: rowData.exp_date,
      exp_date: rowData.exp_date ? `${rowData.exp_date} 00:00:00.000` : null,
    };
    // console.log("receivingDate:", rowData.receivingDate);
    // console.log("invoiceDate :", rowData.invoiceDate);
    // console.log("postingdate :", rowData.postingdate);

    setPoDetail([combinedRow]);
  };
  const handleRowSelect = (id) => {
    setDeleteButton(true);
    setSubmitButton(false);
    setUpdateButton(false);
    setSelectedDeleteRows((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id) // uncheck
        : [...prev, id] // check
    );
  };
  const deleteRec = async () => {
    try {
      setConfirmDelete(false);

      const res = await deleteRecDetail(selectedDeleteRows);

      setSuccessMessage(res.data.message);
      setShowSuccessPopup(true);
      setSelectedDeleteRows([]);
      fetchFindData();
      setDeleteButton(false)
      setSearchText("");

    } catch (error) {
      const msg = error?.response?.data?.message || "Delete failed";
      setErrorMessage(msg);
      setShowErrorPopup(true);
    }
  };


  const onDeleteClick = () => {
    setConfirmDelete(true);

  }; const handleCancel = () => {
    setSelectedDeleteRows([]);
    setConfirmDelete(false);
    setDeleteButton(false);
    setSubmitButton(true)
  };
  useEffect(() => {
    // console.log("Updated selectedDeleteRows:", selectedDeleteRows);
  }, [selectedDeleteRows]);


  return (
    <div className='ComCssContainer'>
      <div className='ComCssInput'>
        <div className='ComCssFiledName'>
          <p>Receving</p>
        </div>
        <div className="RecevingTexfiled">
          <ThemeProvider theme={TextFiledTheme}>
            {/* <TextField
              id="outlined-basic"
              label="Receving Ticket"
              variant="outlined"
              name="productname"
              value={recTicketNo}
              InputProps={{
                sx: {
                  height: '35px',
                }
              }}
            /> */}
            <RecevingTextFiled
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              ponumber={ponumber}
              setPoDetail={setPoDetail}
              setShowRecevingTable={setShowRecevingTable}
              onSelectPonumber={(value) => {
                setShowRecevingTable(true);
                fetchPoDetail(value).then((res) => {
                  const today = new Date();
                  const formattedDate = today.toISOString().split("T")[0];

                  if (res?.data?.length > 0) {
                    const mappedData = res.data.map((po) => ({
                      ponumber: po.ponumber,
                      vendorname: po.vendorname,
                      partcode: po.partcode,
                      uom: po.uom,
                      partdescription: po.partdescription,
                      tyc: po.tyc,
                      currency: po.currency,
                      orderqty: po.orderqty,
                      ccf: po.ccf,
                      unitprice: po.unitprice,
                      rec_qty: po.rec_qty,
                      expdateapplicable: po.expdateapplicable,
                      shelflife: po.shelflife,
                      openOrderQty: (po.orderqty || 0) - (po.rec_qty || 0),
                      expiryAutoSet: false,
                    }));
                    setPoDetail(mappedData);
                    setFormData((prev) => ({
                      ...prev,
                      ...mappedData[0],
                      postingdate: formattedDate,
                    }));
                  }
                });
              }}
            />
          </ThemeProvider>
        </div>
      </div>
      {showRecevingTable &&
        <div className='RecevingInputHide'>
          <div className="RecevingTexfiled9">
            <ThemeProvider theme={TextFiledTheme}>
              <RecevingTextFiled2 formData={formData} setFormData={setFormData} />
              <RecevingTextFiled3 formData={formData} setFormData={setFormData} />
              <RecevingTextFiled4 formData={formData} setFormData={setFormData} />
              <RecevingTextFiled6 formData={formData} setFormData={setFormData} />
              <RecevingTextFiled5 formData={formData} setFormData={setFormData} />
              <RecevingTextFiled7 formData={formData} setFormData={setFormData} />
              <RecevingTextFiled8 formData={formData} setFormData={setFormData} formErrors={formErrors} />
              <RecevingTextFiled9 formData={formData} setFormData={setFormData} formErrors={formErrors} />
              <RecevingTextFiled17 formData={formData} setFormData={setFormData} formErrors={formErrors} />
            </ThemeProvider>
          </div>

          {showRecevingTable && (

            <div className='RecevingTable'>

              <RecevingTable
                poDetail={poDetail}
                setPoDetail={setPoDetail}
                handleFieldChange={handleFieldChange}
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                onSelectPonumber={(value) => {
                  setShowRecevingTable(!!value);
                  if (value) {
                    fetchPoDetail(value).then((res) => { });
                  }
                }}
              />
            </div>
          )}
          {submitButton && (
            <div className='ComCssButton9'>
              <button className='ComCssSubmitButton' onClick={handleAction} >Submit</button>
              <button className='ComCssClearButton' onClick={formClear}>Clear</button>

            </div>
          )}
          {updateButton && (
            <div className='ComCssButton9'>
              <button className='ComCssUpdateButton' onClick={handleAction} >Update</button>
              <button className='ComCssClearButton' onClick={formClear}>Clear</button>

            </div>
          )}


        </div>
      }
      <div className='RecevingInputHide'>
        {deleteButton && (
          <div className='ComCssButton9'>
            <button className='ComCssDeleteButton' onClick={onDeleteClick} >Delete</button>
            <button className='ComCssClearButton' onClick={formClear}>Clear</button>

          </div>
        )}
        <ColumnTable
          recevingData={recevingData}
          selectedRows={selectedRows}
          totalRows={totalRows}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          searchText={searchText}
          setSearchText={setSearchText}
          handleEdit={handleEdit}
          handleRowSelect={handleRowSelect}
          selectedDeleteRows={selectedDeleteRows}
          exportToExcel={exportToExcel}
        /> </div>
      {/* </div> */}
      {/* </div> */}
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
      <CustomDialog
        open={confirmDelete}
        onClose={handleCancel}
        onConfirm={deleteRec}
        title="Confirm"
        message="Are you sure you want to delete this?"
        color="primary"
      />
    </div>
  )
}
export default Receving