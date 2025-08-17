import React, { useState, useEffect } from 'react';
import { generateColumns } from "../../components/Com_Component/generateColumns";
import CommonDataTable from "../../components/Com_Component/CommonDataTable";
import { FaEdit } from "react-icons/fa";

const OpenReport = () => {
    const [formErrors, setFormErrors] = useState({});
    const [tableData, setTableData] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ptlRequestData, setPtlRequestData] = useState([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requestButton, setRequestButton] = useState(true);
    const [isFrozen, setIsFrozen] = useState(false);
    const [submitButton, setSubmitButton] = useState(true);
    const [clearButton, setClearButton] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [indiviualReport, setIndiviualReport] = useState([])
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [repaierReworkerData, setRepaierReworkerData] = useState([]);
    const [localReportData, setLocalReportData] = useState([]);
    const [downloadDone, setDownloadDone] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);

    const columns = generateColumns({
        fields: [
            "edit",
            "recevingTicketNo",
            "ponumber",
            "vendorname",
            "postingdate",
            "partcode",
            "partdescription",
            "UOM",
            "TYC",
            "invoiceNo",
            "invoiceDate",
            "receivingDate",
            "recevingQty",
            "orderqty",
            "openOrderQty",
            "totalValue",
            "totalValueEuro",
            "unitprice",
            "GRNQty",
            "GRNo",
            "GRDate",
            "GRNComment",

        ],

    });
    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>

                <div className='ComCssFiledName'>
                    <p>PTLOpreator</p>
                </div>
                <CommonDataTable
                    columns={columns}
                    data={indiviualReport}
                    loading={loading}
                    page={page}
                    perPage={perPage}
                    totalRows={totalRows}
                    onPageChange={setPage}
                    onPerPageChange={setPerPage}
                />
            </div>
        </div>
    )
}

export default OpenReport