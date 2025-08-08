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

const fetchReceving =`${url}/Receving/fetchReceving`
export const fetchRec = (page = 0, size = 90)=>{
  return axios.get(fetchReceving, { params: { page, size }, });
} 

const Get_RecevingDetailSearch = `${url}/Receving/fetchFindData`;
export const getRecDetailFind = (page = 0, size = 10, search = "")=>{
  return axios.get(Get_RecevingDetailSearch, { params: { page, size,search: search || undefined, }, });
} 


const Get_DownloadRecDetail = `${url}/Receving/download-excel`;
export const downloadRecevingDetail = () => 
  axios.get(Get_DownloadRecDetail, {
    responseType: "blob",
  });

     const Get_DownloadSearchRecDetail = `${url}/Receving/download-excelSearch`;
export const downloadSearchRecDetail = (search) => 
  axios.get(Get_DownloadSearchRecDetail, {params:{search:search || undefined},
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



const fetchGRNPendingDetail =`${url}/GRN/fetchGRNDetail`
export const fetchGrnPendingDetail = ()=>{
  return axios.get(fetchGRNPendingDetail );
} 

// export const saveGRN = (submitData) => {
//   return axios.post("/api/grn/save", submitData); 
// };

const saveGRNDetail = `${url}/GRN/saveGRN`
export const saveGRN = (formData) => axios.put(saveGRNDetail, formData);


const fetchGRNDetail =`${url}/GRN/fetchGRN`
export const fetchGRN = (page = 0, size = 10)=>{
  return axios.get(fetchGRNDetail, { params: { page, size }, });
} 

const Get_GRNPo = `${url}/GRN/fetchGRNPo`;
export const Get_GRNPonumber = (ponumber)=>{
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


const fetchPutawayDetail =`${url}/Putaway/fetchPutaway`
export const fetchPutaway = (page = 0, size = 10)=>{
  return axios.get(fetchPutawayDetail, { params: { page, size }, });
} 


const savePTL = `${url}/LocalMaster/saveLocalMaster`
export const savePTLStore = (formData) => axios.post(savePTL, formData);


  const get_LocalMaster = `${url}/LocalMaster/fetchPTL`;
export const getLocalMaster = (page = 0, size = 10)=>{
  return axios.get(get_LocalMaster, { params: { page, size }, });
} 


const Get_PTL = `${url}/repaierCon/fetchLocalMaster`;
export const fetchproductPtl = () => axios.get(Get_PTL);


const saveRepaier = `${url}/repaierCon/SaveRepair`
export const savePTLRepaier = (formData) => axios.post(saveRepaier, formData);

const Get_BoardSerialNumber = `${url}/repaierCon/fetchBoard`;
export const fetchBoardSerialNumber = () => axios.get(Get_BoardSerialNumber);


const savePTLRequester = `${url}/repaierCon/updatePtlRequest`
export const savePTLRequest = (formData) => axios.put(savePTLRequester, formData);

const saveDoneRequester = `${url}/repaierCon/updatePtlDone`
export const saveDoneRequest = (formData) => axios.put(saveDoneRequester, formData);

const Get_PTLBoard = `${url}/repaierCon/fetchPTLBoard`;
export const fetchPTLBoard = () => axios.get(Get_PTLBoard);


const savePickRequester = `${url}/repaierCon/updatePtlPick`
export const savePickequest = (formData) => axios.put(savePickRequester, formData);


 const get_LocalINdiviual = `${url}/repaierCon/fetchLocalIndividualReport`;

export const getLocalINdiviual = (page = 0, size = 10, userId) => {
  return axios.get(get_LocalINdiviual, {
    params: { page, size, userId }, // ✅ Pass userId as query param
  });
};

const Get_indiviualDetailSearch = `${url}/repaierCon/fetchLocalIndividualReportSearch`;
export const getindiviualDetailFind = (page = 0, size = 10, userId,search = "")=>{
  return axios.get(Get_indiviualDetailSearch, { params: { page, size,userId,search: search || undefined, }, });
} 
const Get_indiviualDetailFilter = `${url}/repaierCon/fetchLocalIndividualReportFilter`;
export const getindiviualDetailFilter = (page = 0, size = 10, userId, formData) => {
  return axios.post(`${Get_indiviualDetailFilter}?page=${page}&size=${size}&userId=${userId}`, formData);
};
