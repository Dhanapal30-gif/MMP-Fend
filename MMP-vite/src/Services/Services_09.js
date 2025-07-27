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
