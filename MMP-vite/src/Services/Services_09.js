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

