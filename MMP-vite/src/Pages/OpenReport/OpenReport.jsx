import React, { useState, useEffect } from 'react';
import CommonDataTable from '../../components/Com_Component/CommonDataTable';
import { generateColumns } from '../../components/Com_Component/generateColumns';
import { fetchOpenReportFDetail } from '../../Services/Services-Rc';
import './OpenReport.css';

const OpenReport = ({ page, perPage, totalRows, loading, setPage, setPerPage }) => {

    const [openReportDetail, setOpenReportDetail] = useState([]);
    const [totals, setTotals] = useState({ totalOngoing: 0, totalOpen: 0 });

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
            <CommonDataTable
                columns={columns}
                data={openReportDetail}
                page={page}
                perPage={perPage}
                totalRows={totalRows}
                loading={loading}
                onPageChange={setPage}
                onRowsPerPageChange={setPerPage}
            />
        </div>
    );
};

export default OpenReport;
