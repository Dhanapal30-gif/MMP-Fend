import React, { useState, useEffect } from 'react'
import { TextField, MenuItem, Autocomplete, formControlLabelClasses } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import TextFiledTheme from '../COM_Component/TextFiledTheme'; // your custom theme path
import "./Receving.css";
import { fetchPoNumberData, fetchPoDeatil, fetchReceving } from './ReceivingActions';
import { RecevingTextFiled, RecevingTextFiled2, RecevingTextFiled3, RecevingTextFiled4, RecevingTextFiled5, RecevingTextFiled6, RecevingTextFiled7, RecevingTextFiled8, RecevingTextFiled9, RecevingTextFiled17 } from './RecevingTextFiled'; // ✅ no curly braces
import { fetchPoDetail, recevingDetail } from '../ServicesComponent/Services_09';
import { RecevingTable, ColumnTable } from './RecevingTable';
import { GlobalStyles } from '@mui/material';
import CustomDialog from "../COM_Component/CustomDialog";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";

const Receving = () => {
  const [ponumber, setPonumber] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showRecevingTable, setShowRecevingTable] = useState(false);
  const [poDetail, setPoDetail] = useState([]); // ✅ Array instead of object
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [recevingData, setRecevingData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");

  const [formData, setFormData] = useState({
    ponumber: "", vendorname: "", currency: "", postingdate: "", rcBactchCode: "",
    invoiceNo: "", invoiceDate: "", receivingDate: ""
  })


  const generateRecevingNumber = (lastNumber = 250) => {
    const prefeix = "RE";
    const number = lastNumber + 1;
    return prefeix + number.toString().padStart(8, "0");
  }


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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };
  useEffect(() => {
    const newCode = generateRecevingNumber(); // you can fetch last number from DB if needed
    setFormData((prev) => ({
      ...prev,
      recevingTicketNo: newCode,
    }));
  }, []);

  const valiDate = () => {
    const errors = {};
    let isValid = true;

    // Form-level validations
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
        errors[`exp_date-${index}`] = "Please Enter Expiry Date";
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };


  const saveReceving = (e) => {
    e.preventDefault();

    if (!valiDate()) {
      return;
    }

  };

  useEffect(() => {
    fetchPoNumberData(setPonumber);
    fetchReceving(setRecevingData, setTotalRows); // ✅ working

  }, [])

  useEffect(() => {
    fetchReceving(setRecevingData, setTotalRows, page, perPage); // ✅ correct call
  }, [page, perPage]);


  console.log("totalelemnt", totalRows)
  //console.log("formData", formData)

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

  console.log("commonFileds", commonFileds)

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
    //exp_date: formData.exp_date ? `${formData.exp_date} 00:00:00.000` : null,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!valiDate()) return;

    if (selectedRows.length === 0) {
      setErrorMessage("Please select at least one item before submitting.");
      setShowErrorPopup(true);
      return;
    }
    const selectedKeys = new Set(selectedRows); // selectedRows = ["P001-IT01", "P001-IT02"]
    const filteredData = finalData.filter((row) =>
      selectedKeys.has(`${row.ponumber}-${row.partcode}`)
    );

    if (filteredData.length === 0) {
      setErrorMessage("Selected data not matching.");
      setShowErrorPopup(true);
      return;
    }
    const username = sessionStorage.getItem("userName") || "System";
    const updatedFormData = filteredData.map((row) => ({
      ...row,
      createdby: username,
      updatedby: username,

    }));
    console.log("Selected Rows:", selectedRows);
    console.log("Filtered Data:", filteredData); // 🟢 Check here

    recevingDetail(updatedFormData)
      .then((response) => {
        setSuccessMessage(response.data.message);
        setShowSuccessPopup(true);
        setShowRecevingTable(false);
        setPoDetail([]);
        // setFormData({ recevingTicketNo: generateRecevingNumber(lastNumber) });
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message || "Network error, please try again";
        setErrorMessage(message);
        setShowErrorPopup(true);
      });
  };

  console.log("finalData", finalData)

  return (
    <div className='ComCssContainer'>
      <div className='ComCssInput'>
        <div className='ComCssFiledName'>
          <h5>Receving</h5>
        </div>
        <div className="RecevingTexfiled">
          <ThemeProvider theme={TextFiledTheme}>
            <TextField
              id="outlined-basic"
              label="Receving Ticket"
              variant="outlined"
              name="productname"
              value={formData.recevingTicketNo}
              InputProps={{
                sx: {
                  height: '35px',
                }
              }}
            />
            <RecevingTextFiled
              formData={formData}
              setFormData={setFormData}
              formErrors={formErrors}
              ponumber={ponumber}
              setPoDetail={setPoDetail}                 // ✅ add this
              setShowRecevingTable={setShowRecevingTable} // ✅ add this
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

          <div className='RecevingTable'>
            <RecevingTable
              poDetail={poDetail}
              setPoDetail={setPoDetail}
              handleFieldChange={handleFieldChange}
              formData={formData}            // ✅ pass this
              setFormData={setFormData}      // ✅ pass this
              formErrors={formErrors} // ✅ this line must exist
              selectedRows={selectedRows}

              setSelectedRows={setSelectedRows}
              onSelectPonumber={(value) => {
                setShowRecevingTable(!!value); // ✅ show/hide table
                if (value) {
                  fetchPoDetail(value).then((res) => {
                    // ... your mapping logic
                  });
                }
              }}
            />
          </div>

          <div className='ComCssButton9'>
            {<button style={{ backgroundColor: 'green' }} onClick={handleSubmit} >Submit</button>}
          </div>
        </div>
      }
      <div className='RecevingInputHide'>
        <div className='RecevingDetailTable'>
          <h5 className='ComCssTableName'>PO Detail</h5>
                  <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: '9px' }}>
                    <button className="btn btn-success" onClick={() => exportToExcel(searchText)} >
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
          <ColumnTable
            recevingData={recevingData}
            selectedRows={selectedRows}
            totalRows={totalRows}
            page={page}
            perPage={perPage}
            setPage={setPage}
            setPerPage={setPerPage}
          />

        </div>
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

export default Receving