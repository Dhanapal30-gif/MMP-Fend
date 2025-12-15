import axios from "axios";
import { url } from '../app.config';


const fetchPutawayPendingDetail = `${url}/Putaway/fetchPutawayPending`
export const fetchPutawayPending = (page = 0, size = 10, search) => {
  return axios.get(fetchPutawayPendingDetail, { params: { page, size, search }, });
}


const fetchPutawayPartiallyDetail = `${url}/Putaway/fetchPutawayPartially`
export const fetchPutawayPartially = (page = 0, size = 10, search) => {
  return axios.get(fetchPutawayPartiallyDetail, { params: { page, size, search }, });
}

const fetchPutawayAllDetail = `${url}/Putaway/fetchPutawayAll`
export const fetchPutawayAll = (page = 0, size = 10) => {
  return axios.get(fetchPutawayAllDetail, { params: { page, size }, });
}


export const putawayProcess = (ticketNo) => {
  const Get_PutawayProcess = `${url}/Putaway/fetchPutawayProcess?ticketNo=${ticketNo}`;
  return axios.get(Get_PutawayProcess);
};


const fetchPutawayDetailAllSearch = `${url}/Putaway/fetchFindDataAll`;
export const fetchPutawayAllSearch = (page = 0, size = 10, search = "") => {
  return axios.get(fetchPutawayDetailAllSearch, { params: { page, size, search: search || undefined, }, });
}


const saveLightRequest = `${url}/Putaway/sendHardwareInidcation`
export const saveLEDRequest = (formData) => axios.put(saveLightRequest, formData);


const savePutRequest = `${url}/Putaway/savePutawayProcess`
export const savePutawayRequest = (formData) => axios.put(savePutRequest, formData);

const FetchRequesterTypeList = `${url}/RequesterCon/fetchRequesterType`
export const fetchRequesterType = (userId) => {
  return axios.get(FetchRequesterTypeList, {
    params: { userId }   // ✅ pass userId as query param
  });
};

const fetchProductPartcode = `${url}/RequesterCon/fetchproductAndPartcode`
export const fetchProductAndPartcode = (userId, orderType, requesterType) => {
  return axios.get(fetchProductPartcode, {
    params: { userId, orderType, requesterType }   // ✅ pass userId as query param
  });
};

const fetchAvailableAndCompatability = `${url}/RequesterCon/fetchAvailableAndCompatabilityQtyCDetail`
export const fetchAvailableAndCompatabilityQty = (partCode) => {
  return axios.get(fetchAvailableAndCompatability, {
    params: { partCode }   // ✅ pass userId as query param
  });
};

const checkAvailableQty = `${url}/RequesterCon/checkAvailable`;
export const checkAvailable = (partcodeQtyMap) => {
  return axios.post(checkAvailableQty, partcodeQtyMap); // send array as JSON body
};

const requester = `${url}/RequesterCon/saverequestList`
export const saveRequester = (formData) => axios.post(requester, formData);



const fetchRequestTicketDetail = `${url}/RequesterCon/fetchRequesterDetail`;
export const fetchRequestDetail = (page, userId, size) => {
  return axios.get(fetchRequestTicketDetail, {
    params: { page, size, userId }, // ✅ Pass userId as query param
  });
};


const fetchRequesterSaerch = `${url}/RequesterCon/fetchRequesterDetailSearch`;
export const fetchSearchRequester = (page = 0, size = 10, userId, search = "") => {
  return axios.get(fetchRequesterSaerch, {
    params: { page, size, userId, search },
  });
};


const Get_DownloadRequesterSearch = `${url}/RequesterCon/downloadRequesterTable-excel`;
export const downloadRequester = (userId, search) =>
  axios.get(Get_DownloadRequesterSearch, {
    params: { userId, search },
    responseType: "blob",
  });


const fetchApproverTicketList = `${url}/ApproverConController/fetchRequesterApproverTicketList`
export const fetchApproverTicket = (userId) => {
  return axios.get(fetchApproverTicketList, {
    params: { userId }   // ✅ pass userId as query param
  });
};


const FetchApproverDetail = `${url}/ApproverConController/fetchRequesterApproverTicketDetail`
export const fetchApproverTicketDetails = (rec_ticket_no) => {
  return axios.get(FetchApproverDetail, {
    params: { rec_ticket_no }   // ✅ pass userId as query param
  });
};

const saveApproverTicket = `${url}/ApproverConController/saveApproverTicket`
export const saveApproverTickets = (payload) => axios.put(saveApproverTicket, payload);


const fetchRequestTicket = `${url}/IssuacneCon/fetchRequestedList`
export const fetchIssueTicketList = (category) => {
  return axios.get(fetchRequestTicket, {
    params: { category }   // ✅ pass userId as query param
  });
};


const fetchpickDetail = `${url}/IssuacneCon/fetchpickTicketList`
export const fetchpickTicketDetails = (rec_ticket_no) => {
  return axios.get(fetchpickDetail, {
    params: { rec_ticket_no }   // ✅ pass userId as query param
  });
};

const saveIssueBatchcode = `${url}/IssuacneCon/saveIssueQty`
export const saveIssueBatchcodeQty = (payload) => axios.post(saveIssueBatchcode, payload);


const saveDeliverStataus = `${url}/IssuacneCon/saveDeliverStataus`
export const saveDeliver = (submitData) => axios.post(saveDeliverStataus, submitData);


const fetchReturningPartcode = `${url}/ReturningController/fetchPartcode`
export const fetchRetPartcode = (userId, returningType) => {
  return axios.get(fetchReturningPartcode, {
    params: { userId, returningType }   // ✅ pass userId as query param
  });
};

const saveReturningTicket = `${url}/ReturningController/saveReturning`
export const saveReturning = (formData) => axios.post(saveReturningTicket, formData);


const saveReturningApproverTicket = `${url}/ApproverConController/saveReturningApproverL1Ticket`
export const saveAReturningpproverTickets = (payload) => axios.put(saveReturningApproverTicket, payload);

export const putawayReturningProcess = (ticketNo) => {
  const Get_PutawayReturningrocess = `${url}/ReturningController/fetchReturningProcess?ticketNo=${ticketNo}`;
  return axios.get(Get_PutawayReturningrocess);
};


const savePutawayReturnRequest = `${url}/Putaway/savePutawayReturningProcess`
export const savePutawayRetRequest = (formData) => axios.put(savePutawayReturnRequest, formData);

const fetchOpenReport = `${url}/repaierCon/openReport`
export const fetchOpenReportFDetail = (userId) => {
  return axios.get(fetchOpenReport, {});
};



const fetchTransferPartcodeList = `${url}/StockTransferCon/fetchTransferPartcode`;
export const fetchTransferPartcode = (orderType) =>
  axios.get(fetchTransferPartcodeList, {
    params: { orderType },
  });

const saveStockTransferList = `${url}/StockTransferCon/saveStockTransfer`
export const saveStockTransfer = (formData) => axios.post(saveStockTransferList, formData);


const fetchStockTransfer = `${url}/StockTransferCon/fetchStockTransfer`;
export const fetchStockTransferAll = (page = 0, size = 10,search="") => {
  return axios.get(fetchStockTransfer, {
    params: { page, size,search },
  });
};

const fetchTransferTicketList = `${url}/StockTransferCon/fetchTransferTicketNo`;
export const fetchTransferTicket = (stockTransferType) =>
  axios.get(fetchTransferTicketList, {
    params: { stockTransferType },
  });

const fetchTransferTicketDetailList = `${url}/StockTransferCon/fetchTransferTicketProcess`;
export const fetchTransferTicketDetail = (transferTicketNo) =>
  axios.get(fetchTransferTicketDetailList, {
    params: { transferTicketNo },
  });


const savePutStockTransferRequest = `${url}/Putaway/savePutawayStockTransferProcess`
export const savePutawayStockTransferRequest = (formData) => axios.put(savePutStockTransferRequest, formData);


const fetchReworkerBoard = `${url}/repaierCon/fetchBoard`;
export const fetchSearchBoard = (search = "") => {
  return axios.get(fetchReworkerBoard, {
    params: { search },
  });
};

const fetchSuiNo = `${url}/repaierCon/fetchSui`;
export const fetchSearchSuiNo = (suiNo = "") => {
  return axios.get(fetchSuiNo, {
    params: { suiNo },
  });
};


const Delete_Putaway = `${url}/Putaway/deletePutaway`; // Base URL
export const deletePutawayTicket = (ticketNo) => {
  return axios.delete(`${Delete_Putaway}?recingticketno=${ticketNo}`);
};


const saveIssueStataus = `${url}/IssuacneCon/saveIssueStataus`
export const saveIssue = (submitData) => axios.post(saveIssueStataus, submitData);


const saveIssuePtlStataus = `${url}/IssuacneCon/savePtlIssueStataus`
export const savePtlIssue = (submitData) => axios.post(saveIssuePtlStataus, submitData);

const Get_DownloadputawayDetail = `${url}/Putaway/donwloadPutawayAll`;
export const downloadPutawayAll = (search) =>
  axios.get(Get_DownloadputawayDetail, {
    responseType: "blob",
    params: { search }
  });

const Get_DownloadputawayClosed = `${url}/Putaway/donwloadPutawayAll`;
export const downloadPutaway = (search, putawaystatus) =>
  axios.get(Get_DownloadputawayClosed, {
    responseType: "blob",
    params: { search, putawaystatus }
  });

const saveStockApproverTicket = `${url}/ApproverConController/saveStockApprove`
export const saveStockApproverTickets = (payload) => axios.put(saveStockApproverTicket, payload);


const fetchCompatabilityMasterDetail = `${url}/Compatability/fetchcompatabiilityDetail`;
export const fetchComDetail = (page = 0, size = 10,search) => {
  return axios.get(fetchCompatabilityMasterDetail, {
    params: { page, size,search }, // ✅ Pass userId as query param
  });
};

const compatability = `${url}/Compatability/saveCompatability`
export const saveCompatability = (formData) => axios.post(compatability, formData);


const Delete_compatability = `${url}/Compatability/DeleteRecord`;  // Base URL without the id
export const deleteCompatability = (ids,modifiedby) => {
  const query = ids.map(intsysid => `intsysid=${intsysid}`).join('&');
  return axios.delete(`${Delete_compatability}?${query}&modifiedby=${modifiedby}`);
};



const Delete_LocalMaster = `${url}/LocalMaster/DeleteRecord`;  // Base URL without the id
export const deleteLocalMaster = (ids,modifiedby) => {
  const query = ids.map(intsysid => `intsysid=${intsysid}`).join('&');
   return axios.delete(`${Delete_LocalMaster}?${query}&modifiedby=${modifiedby}`);
};

const Delete_LocalPutaway = `${url}/localPutawayCon/DeleteRecord`;  // Base URL without the id
export const deleteLocalPutaway = (ids,modifiedby) => {
  const query = ids.map(intsysid => `intsysid=${intsysid}`).join('&');
   return axios.delete(`${Delete_LocalPutaway}?${query}&modifiedby=${modifiedby}`);
};

const Get_Issuance = `${url}/IssuacneCon/fetchIssueDetail`;
export const getIssuanceData = (page = 0, size = 10, search = "") => {
  return axios.get(Get_Issuance, { params: { page, size, search: search || undefined, }, });
}


const fetchStockUpdatePartcodeList = `${url}/StockTransferCon/fetchStochUpdatePartcode`;
export const fetchStockUpdatePartcode = () =>
  axios.get(fetchStockUpdatePartcodeList, {});


const fetchStockUpdatePartcodeDetailsList = `${url}/StockTransferCon/fetchStockUpdatePartcodeDetails`;
export const fetchStockUpdatePartcodeDetails = (partcode) =>
  axios.get(fetchStockUpdatePartcodeDetailsList, {
    params: { partcode },
  });


  const saveStockUpdateList = `${url}/manualStock/saveStockUpdate`
export const saveStockUpdate = (formData) => axios.post(saveStockUpdateList, formData);




const fetchStockUpdateTableData = `${url}/manualStock/fetchStockUpdateDetails`;
export const fetchStockTableData = (page = 0, size = 10, search = "") => {
  return axios.get(fetchStockUpdateTableData, {
    params: { page, size, search },
  });
};


  const saveStockList = `${url}/manualStock/saveStockEdit`
export const saveStockEdit = (formData) => axios.post(saveStockList, formData);


const Get_DownloadStockManualUpdate = `${url}/manualStock/downloadStockManualUpdateTable-excel`;
export const downloadStockManualUpdate = (search) =>
  axios.get(Get_DownloadStockManualUpdate, {
    params: {search },
    responseType: "blob",
  });

  
const Get_DownloadStockTransfer = `${url}/StockTransferCon/downloadStockTransfer-excel`;
export const downloadStockTransfer = (search) =>
  axios.get(Get_DownloadStockTransfer, {
    params: {search },
    responseType: "blob",
  });

  const Get_DownloadIssuance = `${url}/IssuacneCon/downloadRequesterTable-excel`;
export const downloadIssuance = (search) =>
  axios.get(Get_DownloadIssuance, {
    params: { search },
    responseType: "blob",
  });


const openRc = `${url}/Manual_Rack/openRack`;

export const openRcRack = (rackName) => {
  return axios.post(openRc, {
    rackName: rackName
  });
};


const CloseRc = `${url}/Manual_Rack/CloseRack`;

export const closeRcRack = (rackName) => {
  return axios.delete(CloseRc, {
    data: { rackName }
  });
};


const Get_RcRequest = `${url}/Manual_Rack/getRcRequest`;
export const getRequestDetail = () => axios.get(Get_RcRequest);