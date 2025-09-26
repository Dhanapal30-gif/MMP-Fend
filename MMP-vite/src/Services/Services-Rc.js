import axios from "axios";
import { url } from '../app.config';


const fetchPutawayPendingDetail = `${url}/Putaway/fetchPutawayPending`
export const fetchPutawayPending = (page = 0, size = 10) => {
  return axios.get(fetchPutawayPendingDetail, { params: { page, size }, });
}


const fetchPutawayPartiallyDetail = `${url}/Putaway/fetchPutawayPartially`
export const fetchPutawayPartially = (page = 0, size = 10) => {
  return axios.get(fetchPutawayPartiallyDetail, { params: { page, size }, });
}


export const putawayProcess = (ticketNo) => {
const Get_PutawayProcess = `${url}/Putaway/fetchPutawayProcess?ticketNo=${ticketNo}`;
  return axios.get(Get_PutawayProcess);
};


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
export const fetchProductAndPartcode = (userId,orderType) => {
  return axios.get(fetchProductPartcode, {
    params: { userId ,orderType}   // ✅ pass userId as query param
  });
};

const fetchAvailableAndCompatability = `${url}/RequesterCon/fetchAvailableAndCompatabilityQtyCDetail`
export const fetchAvailableAndCompatabilityQty = (partCode) => {
  return axios.get(fetchAvailableAndCompatability, {
    params: { partCode}   // ✅ pass userId as query param
  });
};

const checkAvailableQty = `${url}/RequesterCon/checkAvailable`;
export const checkAvailable = (partcodeQtyMap) => {
  return axios.post(checkAvailableQty, partcodeQtyMap); // send array as JSON body
};

const requester = `${url}/RequesterCon/saveRequester`
export const saveRequester = (formData) => axios.post(requester, formData);



const fetchRequestTicketDetail = `${url}/RequesterCon/fetchRequesterDetail`;

export const fetchRequestDetail = (page = 0,  userId,size = 10) => {
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
export const downloadRequester = (userId,search) =>
  axios.get(Get_DownloadRequesterSearch, {
    params: { userId,search },
    responseType: "blob",
  });