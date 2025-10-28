import React, { useState, useEffect } from 'react';
import CommonAddDataTable from '../../components/Com_Component/CommonAddDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { fetchOpenReportFDetail } from '../../Services/Services-Rc';
import './OpenReport.css';

const OpenReport = ({ page, totalRows, loading, setPage,  }) => {

    const [openReportDetail, setOpenReportDetail] = useState([]);
    const [totals, setTotals] = useState({ totalOngoing: 0, totalOpen: 0 });
const [perPage, setPerPage] = useState(10); // ✅ must exist

    const columns = generateColumns({
        fields: ["ProductName", "Ongoing", "Open"],
    });

    const fetchApproverTicktes = async () => {
        try {
            const response = await fetchOpenReportFDetail();
            const data = response.data;
            setOpenReportDetail(data.productCounts || []);  // ✅ set productCounts as table data
            setTotals({ totalOngoing: data.totalOngoing, totalOpen: data.totalOpen });
            console.log("Open Report:", data);
        } catch (error) {
            console.error("Error fetching open report:", error);
        }
    };

    useEffect(() => {
        fetchApproverTicktes();
    }, []);

    return (
       <div className='OpenRepoInput'>
                <div className='ComCssFiledName'>
                    <p>Open Report</p>
                </div>
            <div style={{ marginBottom: 16 }}>
                <strong>Total Ongoing:</strong> {totals.totalOngoing} &nbsp;&nbsp;
                <strong>Total Open:</strong> {totals.totalOpen}
            </div>
            <CommonAddDataTable
                columns={columns}
                data={openReportDetail}
                page={page}
                perPage={perPage}
                totalRows={totalRows}
                loading={loading}
                onPageChange={setPage}
  onPerPageChange={setPerPage} // ✅ must be a function
            />
        </div>
    );
};

export default OpenReport;
