import { useEffect, useState } from "react";
import {
  Menu,
  HomeWork,
  Inventory2,
  MoveToInbox,
  Outbox,
  Assignment,
  KeyboardArrowDown,
  CalendarMonth,
  ArrowForward,
} from "@mui/icons-material";




import DashboardHeader from "./components/DashboardHeader";

// KPI
import TotalStockCard from "./components/KPI/TotalStockCard";
import TotalReceiveCard from "./components/KPI/TotalReceiveCard";
import TotalIssuedCard from "./components/KPI/TotalIssuedCard";
import TotalRequestsCard from "./components/KPI/TotalRequestsCard";
import PendingRequestsCard from "./components/KPI/PendingRequestsCard";
import LowStockCard from "./components/KPI/LowStockCard";
import OutOfStockCard from "./components/KPI/OutOfStockCard";
import ActivePartCodesCard from "./components/KPI/ActivePartCodesCard";

// Charts
import StockByCategoryChart from "./components/Charts/StockByCategoryChart";

// Requests
import SelectedRequestDetails from "./components/Requests/SelectedRequestDetails";


// Stock
import LowStockItems from "./components/Stock/LowStockItems";
import OutOfStockItems from "./components/Stock/OutOfStockItems";

import "./StoreDashboard.css";
import { getTopCardDetail,getPendingRequestCount,getTopCardDetailRequests,
  getPendingRequestDetails, getOutOfStockCount,getTopCardDetailReceving,getTopCardDetailStock,getTopCardDetailIssued,
  getTotalPartcodeCount, } from "../../Services/Services_09";

const StoreDashboard = () => {
 const [stockCategory, setStockCategory] = useState("All");
  const [receivePartCode, setReceivePartCode] = useState("");
  const [issuePartCode, setIssuePartCode] = useState("");
  const [requestType, setRequestType] = useState("ALL");

  const [month, setMonth] = useState("May 2025");

  const [receiveFrom, setReceiveFrom] = useState("");
  const [receiveTo, setReceiveTo] = useState("");

  const [issueFrom, setIssueFrom] = useState("");
  const [issueTo, setIssueTo] = useState("");

  // const [requestFrom, setRequestFrom] = useState("");
  // const [requestTo, setRequestTo] = useState("");

  const [requestData, setRequestData] = useState(null);
const [requestLoading, setRequestLoading] = useState(true);

  // =========================
  // DASHBOARD HEADER STATE
  // =========================

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [globalPartCode, setGlobalPartCode] = useState("");

  const [cardData, setCardData] = useState(null);
const [loading, setLoading] = useState(true);

const [stockData, setStockData] = useState(null);
const [receiveData, setReceiveData] = useState(null);
const [issueData, setIssueData] = useState(null);

const [stockLoading, setStockLoading] = useState(true);
const [receiveLoading, setReceiveLoading] = useState(true);
const [issueLoading, setIssueLoading] = useState(true);

const [pendingCount, setPendingCount] = useState(0);
const [pendingDetails, setPendingDetails] = useState([]);
const [partcodeCount, setPartcodeCount] = useState(0);
const [pendingLoading, setPendingLoading] = useState(true);
const [outOfStockItems, setOutOfStockItems] = useState([]);
const [requestPartCode, setRequestPartCode] = useState("");
//   const [globalFromDate, setGlobalFromDate] = useState(
//     `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`
//   );

const [globalFromDate, setGlobalFromDate] = useState("");
const [globalToDate, setGlobalToDate] = useState("");

//   const [globalToDate, setGlobalToDate] = useState(
//     new Date(currentYear, currentMonth + 1, 0)
//       .toISOString()
//       .split("T")[0]
//   );

 

  // Temporary/static part codes
  const partCodes = [
    "All Part Codes",
    "089596D.204",
    "089596D.205",
    "089596D.206",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
useEffect(() => {
  setLoading(true);

  getTopCardDetail({
    partCode: globalPartCode,
    startDate: globalFromDate,
    endDate: globalToDate,
  })
    .then((res) => {
      console.log("Top Card Detail:", res.data);
      setCardData(res.data.data);
    })
    .catch((err) => {
      console.error("Failed to fetch top card details", err);
    })
    .finally(() => {
      setLoading(false);
    });
}, [
  globalPartCode,
  globalFromDate,
  globalToDate,
]);

useEffect(() => {

  setReceiveLoading(true);

  getTopCardDetailReceving({
    partCode: receivePartCode || globalPartCode,
    startDate: receiveFrom,
    endDate: receiveTo,
  })
    .then((res) => {
      console.log("Receive Response:", res.data);

      setReceiveData(res.data.data);
    })
    .catch((err) => {
      console.error(
        "Failed to fetch receiving details",
        err
      );
    })
    .finally(() => {
      setReceiveLoading(false);
    });

}, [
  receivePartCode,
  receiveFrom,
  receiveTo,
  globalPartCode
]);

useEffect(() => {

  setStockLoading(true);

  const componentUsage =
    stockCategory === "All"
      ? ""
      : stockCategory;

  getTopCardDetailStock({
    componentUsage,
    partCode: globalPartCode,
  })
    .then((res) => {
      console.log("Stock Response:", res.data);

      setStockData(res.data.data);
    })
    .catch((err) => {
      console.error(
        "Failed to fetch stock details",
        err
      );
    })
    .finally(() => {
      setStockLoading(false);
    });

}, [
  stockCategory,
  globalPartCode
]);



useEffect(() => {

  setIssueLoading(true);

  getTopCardDetailIssued({
    partCode: issuePartCode || globalPartCode,
    startDate: issueFrom,
    endDate: issueTo,
  })
    .then((res) => {
      console.log("Issued Response:", res.data);

      setIssueData(res.data.data);
    })
    .catch((err) => {
      console.error(
        "Failed to fetch issued details",
        err
      );
    })
    .finally(() => {
      setIssueLoading(false);
    });

}, [
  issuePartCode,
  issueFrom,
  issueTo,
  globalPartCode
]);

useEffect(() => {
  setRequestLoading(true);

  getTopCardDetailRequests({
    partCode: requestPartCode || globalPartCode,
    requestType: requestType,
  })
    .then((res) => {
      console.log("Total Requests Response:", res.data);

      setRequestData(res.data.data);
    })
    .catch((err) => {
      console.error(
        "Failed to fetch total requests",
        err
      );
    })
    .finally(() => {
      setRequestLoading(false);
    });

}, [
  requestType,
  requestPartCode,
  globalPartCode,
]);


useEffect(() => {
  setPendingLoading(true);
  Promise.all([
    getPendingRequestCount(),
    getPendingRequestDetails(),
    getTotalPartcodeCount(),
    getOutOfStockCount(),
  ])
   .then(([countRes, detailsRes, partcodeRes, stockcount]) => {

  setPendingCount(countRes.data ?? 0);

  setPendingDetails(detailsRes.data ?? []);

  setPartcodeCount(partcodeRes.data ?? 0);

  console.log("Out Of Stock Response:", stockcount.data);

  const outOfStockData = (stockcount.data ?? []).map((item) => {
    const [partCode, ...descriptionParts] = item.split(",");

    return {
      partCode: partCode?.trim(),
      description: descriptionParts.join(",").trim(),
      availableQty: 0,
      uom: "NOS",
    };
  });

  setOutOfStockItems(outOfStockData);
})
    .catch((err) =>
      console.error("Failed to fetch pending/partcode KPI data", err)
    )
    .finally(() => setPendingLoading(false));
}, []);

console.log("Pending Count:", pendingCount)

console.log("Part Code Count:", partcodeCount)
  return (
    
  <div className="store-dashboard">

    <DashboardHeader
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
      globalPartCode={globalPartCode}
      setGlobalPartCode={setGlobalPartCode}
      globalFromDate={globalFromDate}
      setGlobalFromDate={setGlobalFromDate}
      globalToDate={globalToDate}
      setGlobalToDate={setGlobalToDate}
      currentYear={currentYear}
      currentMonth={currentMonth}
      partCodes={partCodes}
    />


    {/* ================================
        KPI ROW 1
    ================================= */}

    <section className="kpi-grid">

  <TotalStockCard
  stockCategory={stockCategory}
  setStockCategory={setStockCategory}
  quantity={stockData?.sumStockQty ?? 0}
  value={stockData?.sumStockValue ?? 0}
  loading={stockLoading}
/>
<TotalReceiveCard
  receivePartCode={receivePartCode}
  setReceivePartCode={setReceivePartCode}
  receiveFrom={receiveFrom}
  setReceiveFrom={setReceiveFrom}
  receiveTo={receiveTo}
  setReceiveTo={setReceiveTo}
  partCodes={partCodes}
  quantity={receiveData?.sumReceivingQty ?? 0}
  value={receiveData?.sumReceivingValue ?? 0}
  loading={receiveLoading}
/>

<TotalIssuedCard
  issuePartCode={issuePartCode}
  setIssuePartCode={setIssuePartCode}
  issueFrom={issueFrom}
  setIssueFrom={setIssueFrom}
  issueTo={issueTo}
  setIssueTo={setIssueTo}
  partCodes={partCodes}
  quantity={issueData?.issuedQty ?? 0}
  value={issueData?.issuedValue ?? 0}
  loading={issueLoading}
/>

  <TotalRequestsCard
    requestType={requestType}
    setRequestType={setRequestType}
    // requestFrom={requestFrom}
     requestPartCode={requestPartCode}
  setRequestPartCode={setRequestPartCode}
  partCodes={partCodes}
    // setRequestFrom={setRequestFrom}
    // requestTo={requestTo}
    // setRequestTo={setRequestTo}
    count={requestData?.totalRequests ?? 0}
    loading={requestLoading}
  />

</section>


    {/* ================================
        KPI ROW 2
    ================================= */}

    <section className="kpi-grid">

      <PendingRequestsCard
        totalRequests={pendingCount}
  completedRequests={0}
      />

      <LowStockCard
        count={18}
      />

      <OutOfStockCard
          count={outOfStockItems.length}
      />

      <ActivePartCodesCard
         count={partcodeCount}
      />

    </section>


    {/* ================================
        CHART + REQUEST DETAILS
    ================================= */}

    <section className="dashboard-content-grid">

      <StockByCategoryChart
        selectedMonth={
          monthNames[selectedMonth]
        }
        selectedYear={
          selectedYear
        }
      />

      <SelectedRequestDetails
  requests={pendingDetails}
/>

    </section>


    {/* ================================
        RECENT REQUESTS
    ================================= */}

    {/* <section className="dashboard-single-section">

      <RecentRequests />

    </section> */}


    {/* ================================
        STOCK TABLES
    ================================= */}

    <section className="stock-tables-grid">

      <LowStockItems />

     <OutOfStockItems
  items={outOfStockItems}
/>

    </section>

  </div>

  );
};

export default StoreDashboard;