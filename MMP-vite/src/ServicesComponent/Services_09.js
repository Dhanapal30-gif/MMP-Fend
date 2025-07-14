import axios from "axios";
import { url } from '../app.config';



const Get_PoNumber = `${url}/Receving/getPoNumber`;
export const fetchPonumber = () => axios.get(Get_PoNumber);


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

