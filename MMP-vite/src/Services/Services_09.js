import axios from "axios";
import { url } from '../app.config';



const Get_PoNumber = `${url}/Receving/getPoNumber`;
export const fetchPonumber = () => axios.get(Get_PoNumber);

const Get_recTicketNo = `${url}/Receving/ricevingticketNo`;
export const fetchRecTicketNo = () => axios.get(Get_recTicketNo);


export const fetchPoDetail = (ponumber) => {
  const Get_PoDetail = `${url}/Receving/getPoDetail/${ponumber}`;
  return axios.get(Get_PoDetail);
};

const saveRecevingDetail = `${url}/Receving/saveReceving`
export const recevingDetail = (formData) => axios.post(saveRecevingDetail, formData);

const fetchReceving = `${url}/Receving/fetchReceving`
export const fetchRec = (page = 0, size = 90) => {
  return axios.get(fetchReceving, { params: { page, size }, });
}

const Get_RecevingDetailSearch = `${url}/Receving/fetchFindData`;
export const getRecDetailFind = (page = 0, size = 10, search = "") => {
  return axios.get(Get_RecevingDetailSearch, { params: { page, size, search: search || undefined, }, });
}


const Get_DownloadRecDetail = `${url}/Receving/download-excel`;
export const downloadRecevingDetail = () =>
  axios.get(Get_DownloadRecDetail, {
    responseType: "blob",
  });

const Get_DownloadSearchRecDetail = `${url}/Receving/download-excelSearch`;
export const downloadSearchRecDetail = (search) =>
  axios.get(Get_DownloadSearchRecDetail, {
    params: { search: search || undefined },
    responseType: "blob",
  });

const updateReceiving = `${url}/Receving/updateRecDetail`;
export const updateRecDeatil = (id, formData) =>
  axios.put(`${updateReceiving}/${id}`, formData);

const Delete_RecDetail = `${url}/Receving/deleteRecDetail`;  // Base URL without the id
export const deleteRecDetail = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_RecDetail}?${query}`);
};



const fetchGRNPendingDetail = `${url}/GRN/fetchGRNDetail`
export const fetchGrnPendingDetail = () => {
  return axios.get(fetchGRNPendingDetail);
}

// export const saveGRN = (submitData) => {
//   return axios.post("/api/grn/save", submitData); 
// };

const saveGRNDetail = `${url}/GRN/saveGRN`
export const saveGRN = (formData) => axios.put(saveGRNDetail, formData);


const fetchGRNDetail = `${url}/GRN/fetchGRN`
export const fetchGRN = (page = 0, size = 10) => {
  return axios.get(fetchGRNDetail, { params: { page, size }, });
}

const Get_GRNPo = `${url}/GRN/fetchGRNPo`;
export const Get_GRNPonumber = (ponumber) => {
  return axios.get(Get_GRNPo, { params: { ponumber }, });
}


const updateGRN = `${url}/GRN/updateGRNDetail`;

export const updateGRNDetail = (id, formData) =>
  axios.put(`${updateGRN}/${id}`, formData);

const Get_PoDeatil = `${url}/poStataus/fetchPoDetail`;
export const fetchPoStatus = ({ page = 0, size = 20, ponumber, status, year, partcode } = {}) => {
  return axios.get(Get_PoDeatil, {
    params: { page, size, ponumber, status, year, partcode },
  });
};


// const savePo = `${url}/poStataus/savePoStatus`
export const savePoStataus = (id, formData) =>
  axios.put(`${url}/poStataus/savePoStatus/${id}`, formData);


const Get_RecTick = `${url}/Putaway/getRecTicketNo`;
export const fetchPutTicket = () => axios.get(Get_RecTick);


const fetchPutawayDetail = `${url}/Putaway/fetchPutaway`
export const fetchPutaway = (page = 0, size = 10,search) => {
  return axios.get(fetchPutawayDetail, { params: { page, size,search }, });
}


const savePTL = `${url}/LocalMaster/saveLocalMaster`
export const savePTLStore = (formData) => axios.post(savePTL, formData);


const get_LocalMaster = `${url}/LocalMaster/fetchPTL`;
export const getLocalMaster = (page = 0, size = 10) => {
  return axios.get(get_LocalMaster, { params: { page, size }, });
}

const Get_LocalMasterSearch = `${url}/LocalMaster/fetchPutawayDetail`;
export const getLocalkMasterSearch = (page = 0, size = 10, search = "") => {
  return axios.get(Get_LocalMasterSearch, { params: { page, size, search: search || undefined, }, });
}


const Get_DownloadLocalMaster = `${url}/LocalMaster/download-excel`;
export const downloadLocalMaster = () =>
  axios.get(Get_DownloadLocalMaster, {
    responseType: "blob",
  });

const Get_DownloadSearchLocalMaster = `${url}/LocalMaster/download-excelSearch`;
export const downloadSearchLocalMaster = (search) =>
  axios.get(Get_DownloadSearchLocalMaster, {
    params: { search: search || undefined },
    responseType: "blob", // 👈 essential for binary Excel files
  });

const Get_PTL = `${url}/repaierCon/fetchLocalMaster`;
export const fetchproductPtl = () => axios.get(Get_PTL);


const saveRepaier = `${url}/repaierCon/SaveRepair`
export const savePTLRepaier = (formData) => axios.post(saveRepaier, formData);

const Get_BoardSerialNumber = `${url}/repaierCon/fetchBoard`;
export const fetchBoardSerialNumber = () => axios.get(Get_BoardSerialNumber);


const savePTLRequester = `${url}/repaierCon/updatePtlRequest`
export const savePTLRequest = (formData) => axios.put(savePTLRequester, formData);

const savePTLRequestSubmit = `${url}/repaierCon/savePTLSubmit`
export const savePTLSubmit = (formData) => axios.put(savePTLRequestSubmit, formData);

const saveReworkerRequestSubmit = `${url}/repaierCon/saveReworkerSubmit`
export const saveReworkerSubmit = (formData) => axios.put(saveReworkerRequestSubmit, formData);


const saveDoneRequester = `${url}/repaierCon/updatePtlDone`
export const saveDoneRequest = (formData) => axios.put(saveDoneRequester, formData);

const Get_PTLBoard = `${url}/repaierCon/fetchPTLBoard`;
export const fetchPTLBoard = () => axios.get(Get_PTLBoard);


const savePickRequester = `${url}/repaierCon/sendPTLRack`;

export const savePickequest = (base64Payload) => {
  return axios.post(savePickRequester, base64Payload, {
    headers: { "Content-Type": "text/plain" } // send raw string
  });
};

const get_LocalINdiviual = `${url}/repaierCon/fetchLocalIndividualReport`;

export const getLocalINdiviual = (page = 0, size = 10, userId) => {
  return axios.get(get_LocalINdiviual, {
    params: { page, size, userId }, // ✅ Pass userId as query param
  });
};

const Get_indiviualDetailSearch = `${url}/repaierCon/fetchLocalIndividualReportSearch`;
export const getindiviualDetailFind = (page = 0, size = 10, userId, search = "") => {
  return axios.get(Get_indiviualDetailSearch, { params: { page, size, userId, search: search || undefined, }, });
}

const Get_indiviualDetailFilter = `${url}/repaierCon/fetchLocalIndividualReportFilter`;
export const getindiviualDetailFilter = (page = 0, size = 10, userId, formData) => {
  return axios.post(`${Get_indiviualDetailFilter}?page=${page}&size=${size}&userId=${userId}`, formData);
};

const Get_DownloadLocalReport = `${url}/repaierCon/downloadLocalReport-excel`;
export const downloadLocalReport = () =>
  axios.get(Get_DownloadLocalReport, {
    responseType: "blob",
  });

const Get_DownloadLocalReportSearch = `${url}/repaierCon/downloadLocalReport-excel`;
export const downloadLocalReportSearch = (search) =>
  axios.get(Get_DownloadLocalReportSearch, {
    params: { search },
    responseType: "blob",
  });

const Get_DownloadLocalReportFilter = `${url}/repaierCon/downloadLocalReportFilter-excel`;
export const downloadLocalReportFilter = (formData) =>
  axios.post(Get_DownloadLocalReportFilter, formData, {
    responseType: "blob",
  });

//   const Get_DownloadLocalIndiviualReport = `${url}/repaierCon/downloadLocalIndiviualReport-excel`;
// export const downloadLocalIndiviualReport = (userId) => 
//   axios.get(Get_DownloadLocalIndiviualReport, {
//     params: {  userId },
//     responseType: "blob", 
//   });

//   const Get_DownloadLocalIndiviualReportSearch = `${url}/repaierCon/downloadLocalIndiviualReportrt-excel`;
// export const downloadLocalIndiviualReportSearch = (search, userId, formData) =>
//   axios.get(Get_DownloadLocalIndiviualReportSearch, {
//     params: { search, userId, ...formData },
//     responseType: "blob",
//   });
const Get_DownloadLocalIndiviualReport = `${url}/repaierCon/downloadLocalIndiviualReportrt-excel`;
export const downloadIndiviualReport = (userId) =>
  axios.get(Get_DownloadLocalIndiviualReport, {
    params: { userId },
    responseType: "blob",
  });

const Get_DownloadLocalIndiviualReportSearch = `${url}/repaierCon/downloadLocalIndiviualReportrt-excel`;
export const downloadLocalIndiviualReportSearch = (userId, search) =>
  axios.get(Get_DownloadLocalIndiviualReportSearch, {
    params: { userId, search },
    responseType: "blob",
  });

const Get_DownloadLocalIndiviualReportFilter = `${url}/repaierCon/downloadLocalReportFilter-excel`;

export const downloadLocalIndiviualReportFilter = (formData, userId) =>
  axios.post(
    Get_DownloadLocalIndiviualReportFilter,
    { ...formData, userId },  // merge into one request body
    { responseType: "blob" }  // config
  );

const Get_Repaier = `${url}/repaierCon/fetchRepairReworkerName`;
export const fetchRepaier = () => axios.get(Get_Repaier);


const get_LocalReport = `${url}/repaierCon/fetchLocalReport`;
export const getLocalReport = (page = 0, size = 10) => {
  return axios.get(get_LocalReport, { params: { page, size }, });
};

const Get_LocalDetailSearch = `${url}/repaierCon/fetchLocalReportSearch`;
export const getLocalDetailFind = (page = 0, size = 10, search = "") => {
  return axios.get(Get_LocalDetailSearch, { params: { page, size, search: search || undefined, }, });
}

const Get_LocalReportDetailFilter = `${url}/repaierCon/fetchLocalReportFilter`;
export const getLocalReportDetailFilter = (page = 0, size = 10, formData) => {
  return axios.post(`${Get_LocalReportDetailFilter}?page=${page}&size=${size}`, formData);
};



const Get_PTLPutaway = `${url}/localPutawayCon/fetchPTLStorePutaway`;
export const fetchPTLPutaway = () => axios.get(Get_PTLPutaway);


const savePTLPutaway = `${url}/localPutawayCon/savePutaway`
export const savePutaway = (formData) => axios.put(savePTLPutaway, formData);

const savePut = `${url}/localPutawayCon/saveShowLocation`
export const savePutLocation = (formData) => axios.put(savePut, formData);

const get_LocalPutaway = `${url}/localPutawayCon/fetchPutaway`;
export const getLocalPutaway = (page = 0, size = 10) => {
  return axios.get(get_LocalPutaway, { params: { page, size }, });
}

const Get_LocalPutawaySearch = `${url}/localPutawayCon/fetchPutawayDetail`;
export const getLocalPutawaySearch = (page = 0, size = 10, search = "") => {
  return axios.get(Get_LocalPutawaySearch, { params: { page, size, search: search || undefined, }, });
}

const Get_DownloadLocalPutaway = `${url}/localPutawayCon/download-excel`;
export const downloadLocal = () =>
  axios.get(Get_DownloadLocalPutaway, {
    responseType: "blob",
  });

const Get_DownloadSearchLocalPutaway = `${url}/localPutawayCon/download-excelSearch`;
export const downloadSearchLocal = (search) =>
  axios.get(Get_DownloadSearchLocalPutaway, {
    params: { search: search || undefined },
    responseType: "blob", // 👈 essential for binary Excel files
  });

const Get_RcPartcode = `${url}/TechnologyCon/getPartcode`;
export const getPartcode = () => axios.get(Get_RcPartcode);


const save_PoDeatil = `${url}/TechnologyCon/saveTechnology`;
export const saveTechnology = (formData) => axios.post(save_PoDeatil, formData);

const get_Technology = `${url}/TechnologyCon/fetchTechnology`;
export const fetchTechnology = (page = 0, size = 10) => {
  return axios.get(get_Technology, { params: { page, size }, });
}

const saveRoleMaster = `${url}/role/saveRole`
export const saveRole = (formData) => axios.post(saveRoleMaster, formData);

const saveRoleAssign = `${url}/role/saveRoleAssign`
export const saveScreenAsign = (formData7) => axios.post(saveRoleAssign, formData7);

const fetchRoleBasedScreen = `${url}/userAuth/fetchScreenNames`;

export const fetchScreens = (roles) => {
  return axios.post(`${url}/userAuth/fetchScreenNames`, roles, {
    headers: { "Content-Type": "application/json" }
  });
};

const get_RoleMaster= `${url}/role/fetchRoleAssign`;
export const fetchRoleScreen = () => {
  return axios.get(get_RoleMaster);
}


const updateRoleMatser = `${url}/role/updateRole`
export const updateRole = (formData7) => axios.put(updateRoleMatser, formData7);

const fetchUser = `${url}/userAuth/fetchUserList`
export const fetchUserDetail = () => axios.get(fetchUser);

const updateUser= `${url}/userAuth/updateUserDetail`
export const updateUserDetail = (formData) => axios.put(updateUser, formData);


const Get_PTLPartcode = `${url}/RcMain/getPTLPartcodeList`;
export const getPTLPartcode = () => axios.get(Get_PTLPartcode);

const savePTLRequestList = `${url}/PTLOpreator/savePtlRequester`
export const savePTLOpreatorRequest = (formData) => axios.post(savePTLRequestList, formData);


const savePtlApproverTicket = `${url}/ApproverConController/savePtlApproverTicket`
export const savePtlApproverTickets = (payload) => axios.put(savePtlApproverTicket, payload);


const savePtlDeliverStataus = `${url}/IssuacneCon/savePtlDeliverStataus`
export const savePtlDeliver = (submitData) => axios.post(savePtlDeliverStataus, submitData);


const savePtlIssueStataus = `${url}/IssuacneCon/savePtlIssueStataus`
export const savePtlIssue = (submitData) => axios.post(savePtlIssueStataus, submitData);

const fetchPTLRequestTicketDetail = `${url}/PTLOpreator/fetchPTLRequestDetail`;
export const fetchPTLRequestDetail = (search,page,  size) => {
  return axios.get(fetchPTLRequestTicketDetail, {
    params: {search, page, size }, // ✅ Pass userId as query param
  });
};

const Get_DownloadPTLRequestSearch = `${url}/PTLOpreator/downloadPTLRequestTable-excel`;
export const downloadPTLRequest = ( search) =>
  axios.get(Get_DownloadPTLRequestSearch, {
    params: {  search },
    responseType: "blob",
  });


  const Get_DownloadSearchComMaster = `${url}/Compatability/download-excel`;
export const downloadComMaster = (search) =>
  axios.get(Get_DownloadSearchComMaster, {
    params: { search: search || undefined },
    responseType: "blob", // 👈 essential for binary Excel files
  });

  const get_StockDetails = `${url}/StockTransferCon/fetchStockDetails`;
export const getStockDetais = (page = 0, size = 10,search = "") => {
  return axios.get(get_StockDetails, { params: { page, size,search }, });
}


const Get_DownloadStock = `${url}/StockTransferCon/download-excelSearch`;
export const downloadStock = (search) =>
  axios.get(Get_DownloadStock, {
    params: { search: search || undefined },
    responseType: "blob", // 👈 essential for binary Excel files
  });