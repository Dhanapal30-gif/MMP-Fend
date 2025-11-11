import axios from "axios";
import { url } from '../app.config';

//Login API
const Login_Api = `${url}/userAuth/login`
export const LoginUser = (formData) => axios.post(Login_Api, formData);

const Careate_Api = `${url}/userAuth/createAccount`
export const CreateAccountUser = (formData) => axios.post(Careate_Api, formData);

//Product family master API
const Save_Product = `${url}/saveProduct`;
export const saveProductMaster = (formData) => axios.post(Save_Product, formData);

const Save_All = `${url}/saveProductsBulk`;
export const saveProductsBulk = (excelUploadData) => axios.post(Save_All, excelUploadData);

const Get_UserMailId = `${url}/getEmailId`;
export const getUserMailId = () => axios.get(Get_UserMailId);

const Get_ProductMasterData = `${url}/getProduct`;
export const getProductMasterData = (page = 0, size = 10, search = "") => {
  return axios.get(Get_ProductMasterData, { params: { page, size,search: search || undefined, }, });
};

const Update_Product = (id) => `${url}/updateProduct/${id}`;
export const updateProduct = (id, formData) => {
  if (!id) {
    console.error("❌ Error: Missing ID for update request");
    return Promise.reject(new Error("Missing ID"));
  }
  return axios.put(Update_Product(id), formData);
};

const Get_DownloadProduct = `${url}/download-excel`;
export const downloadProduct = () => 
  axios.get(Get_DownloadProduct, {
    responseType: "blob", // 👈 essential for binary Excel files
  });

const Delete_product = `${url}/deleteProduct`;  // Base URL without the id
export const deleteproduct = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_product}?${query}`);
};
  const Get_DownloadSearchProduct = `${url}/download-excelSearch`;
export const downloadSearchProduct = (search) => 
  axios.get(Get_DownloadSearchProduct, {params:{search:search || undefined},
    responseType: "blob", // 👈 essential for binary Excel files
  });

  //RcStore API
const Save_RcMain = `${url}/RcMain/Save`;
export const saveMainMaterial = (formData) => axios.post(Save_RcMain, formData);

const Save_BulkRc =`${url}/RcMain/bulk_Save`
export const saveBulkRcMain = (excelUploadData) =>axios.post(Save_BulkRc,excelUploadData)

const Get_RCStore = `${url}/RcMain/getFetchDataRc`;
export const getRcmainMaster = (page = 0, size = 90)=>{
  return axios.get(Get_RCStore, { params: { page, size }, });
} 


const Get_RCStoreFind = `${url}/RcMain/fetchFinddata`;
export const getRcmainMasterFind = (page = 0, size = 10, search = "")=>{
  return axios.get(Get_RCStoreFind, { params: { page, size,search: search || undefined, }, });
} 

// const Get_RCStoreFind = `${url}/RcMain/es-search`;

// export const getRcmainMasterFind = (page = 0, size = 10, search = "") => {
//   return fetch(
//     `${Get_RCStoreFind}?page=${page}&size=${size}${search ? `&keyword=${encodeURIComponent(search)}` : ""}`
//   ).then(res => {
//     if (!res.ok) throw new Error("Network response was not ok");
//     return res.json();
//   });
// };


// const Get_RcStore = `${url}/RcMain/getRcdata`
// export const getRcmainMaster= ()=>axios.get(Get_RcStore);
const update_Rc = `${url}/RcMain/updateRcStore`;
export const updateRcSrore = (id, formData) =>
  axios.put(`${update_Rc}/${id}`, formData);

const Delete_Rc = `${url}/RcMain/deleteRcStore`;  // Base URL without the id
export const deleteRc = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_Rc}?${query}`);
};
// const Get_RCStore = `${url}/RcMain/getPageDatatyu`;
// export const getRcmainMaster = () => axios.get(Get_RCStore);

const Get_DownloadRcMain = `${url}/RcMain/download-excel`;
export const downloadRc = () => 
  axios.get(Get_DownloadRcMain, {
    responseType: "blob", // 👈 essential for binary Excel files
  });

  const Get_DownloadSearchRc = `${url}/RcMain/download-excelSearch`;
export const downloadSearchRc = (search) => 
  axios.get(Get_DownloadSearchRc, {params:{search:search || undefined},
    responseType: "blob", // 👈 essential for binary Excel files
  });


const save_Vendor = `${url}/vendorMaster/saveVendor`
export const saveVendorMaster = (formData) => axios.post(save_Vendor, formData);

const save_ExcelVendorUpload = `${url}/vendorMaster/saveExcelUpload`
export const saveExcelVendorUpload = (formData)=>axios.post(save_ExcelVendorUpload,formData);

const Get_VendorMaster = `${url}/vendorMaster/getVenodtMaster`;
export const getVenodtMaster = () => axios.get(Get_VendorMaster);

const update_Vendor = `${url}/vendorMaster/updateVendor`;
export const updateVendor = (id, formData) =>
  axios.put(`${update_Vendor}/${id}`, formData);

const Delete_Vednor = `${url}/vendorMaster/deleteVendor`;  // Base URL without the id
export const deleteVendor = (id) => {
  const query = id.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_Vednor}?${query}`);
};

const Get_DownloadVendor = `${url}/vendorMaster/download-excel`;
export const downloadVendor = () => 
  axios.get(Get_DownloadVendor, {
    responseType: "blob", // 👈 essential for binary Excel files
  });

  const Get_DownloadSearchVendor = `${url}/vendorMaster/download-excelSearch`;
export const downloadSearchVendor = (search) => 
  axios.get(Get_DownloadSearchVendor, {params:{search:search || undefined},
    responseType: "blob", // 👈 essential for binary Excel files
  });


const Get_RcPartcode = `${url}/Bom/getPartcode`;
export const getPartcode = () => axios.get(Get_RcPartcode);

const Get_Product = `${url}/Bom/getProduct`;
export const getProduct = () => axios.get(Get_Product);

const save_Bom = `${url}/Bom/SaveBom`
export const saveBomMaster = (formData) => axios.post(save_Bom, formData);

const save_BomUpload = `${url}/Bom/bulck_upload`
export const saveBomMasterUpload = (formData) => axios.post(save_BomUpload, formData);

// const get_BomMaste=`${url}/BOM/fetchBom`
// export const getBoMaster=()=>axios.get(get_BomMaste);


// const get_BomMaste = `${url}/BOM/fetchBom`;
// export const getBoMaster = (page = 0, size = 10)=>{
//   return axios.get(Get_RCStoreFind, { params: { page, size}, })};

  const get_BomMaste = `${url}/Bom/fetchBomMaster`;
export const getBoMaster = (page = 0, size = 10,search = "")=>{
  return axios.get(get_BomMaste, { params: { page, size,search: search || undefined }, });
} 

const update_Bom = `${url}/Bom/updateBom`;
export const updateBomMaster = (intsysid, formData) =>
  axios.put(`${update_Bom}/${intsysid}`, formData);

const Delete_Bom = `${url}/Bom/deleteBom`;  // Base URL without the id
export const deleteBom = (ids) => {
  const query = ids.map(intsysid => `intsysid=${intsysid}`).join('&');
  return axios.delete(`${Delete_Bom}?${query}`);
};

const Get_BomSearch = `${url}/Bom/fetchFindData`;
export const getBomMasterFind = (page = 0, size = 10, search = "")=>{
  return axios.get(Get_BomSearch, { params: { page, size,search: search || undefined, }, });
} 

const Get_DownloadBom = `${url}/Bom/download-excel`;
export const downloadBom = () => 
  axios.get(Get_DownloadBom, {
    responseType: "blob", // 👈 essential for binary Excel files
  });

  const Get_DownloadSearchBom = `${url}/Bom/download-excelSearch`;
export const downloadSearchBom = (search) => 
  axios.get(Get_DownloadSearchBom, {params:{search:search || undefined},
    responseType: "blob", // 👈 essential for binary Excel files
  });

  //CurnecyMaster
  const save_Curnecy = `${url}/Currency/SaveCurency`;
export const saveCurencyMaster = (formData) => axios.post(save_Curnecy, formData);

  const get_Curency = `${url}/Currency/fetchCurency`;
export const fetchCurency = ()=>{
  return axios.get(get_Curency);
} 
const update_Curency = `${url}/Currency/updateCurrency`;
export const updateCurrency = (id, formData) =>
  axios.put(`${update_Curency}/${id}`, formData);


const Delete_Curency = `${url}/Currency/deleteRcStore`;  // Base URL without the id
export const deleteCurency = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_Curency}?${query}`);
};

const get_ProductDeatil =`${url}/Approval/getProductDetail`;
export const fetchProdcutDetail = ()=>{
  return axios.get(get_ProductDeatil);
}


const save_Approval = `${url}/Approval/saveApproval`
export const saveApprovalMaster = (formData) => axios.post(save_Approval, formData);

 const get_Approval = `${url}/Approval/fetchApprovalMaster`;
export const fetchApproval = ()=>{ return axios.get(get_Approval); } 


const save_uploadApproval = `${url}/Approval/upload`
export const uploadApprovalMaster = (formData) => axios.post(save_uploadApproval, formData);


const Delete_Appproval = `${url}/Approval/deleteApproval`;  // Base URL without the id
export const deleteApproval = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_Appproval}?${query}`);
};

const update_Approval = `${url}/Approval/updateApproval`;
export const updateApproval = (id, formData) =>
  axios.put(`${update_Approval}/${id}`, formData);


  const save_PoDeatil = `${url}/Podeatil/savePo`;
export const savePoDetail = (formData) => axios.post(save_PoDeatil, formData);

//  const get_PoDeatil = `${url}/Podeatil/fetchPoDetail`;
// export const fetchPoDeatil = ()=>{ return axios.get(get_PoDeatil); } 


 const get_PoDeatil = `${url}/Podeatil/fetchPoDetail`;
export const fetchPoDeatil = (page = 0, size = 10)=>{
  return axios.get(get_PoDeatil, { params: { page, size }, });
} 

// const update_PoDetail = `${url}/Podeatil/updatePoDetail`;
// export const updatePoDetaildata = (intsysid, formData) =>
//   axios.put(`${update_PoDetail}/${intsysid}`, formData);

const update_PoDeatil = `${url}/Podeatil/updatePoDetail`;
export const updatePoDeatil = (id, formData) =>
  axios.put(`${update_PoDeatil}/${id}`, formData);


const Delete_PoDetail = `${url}/Podeatil/deletePoDetail`;  // Base URL without the id
export const deletePoDetail = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_PoDetail}?${query}`);
};


const Get_PoDetailSearch = `${url}/Podeatil/fetchFindData`;
export const getPoDetailFind = (page = 0, size = 10, search = "")=>{
  return axios.get(Get_PoDetailSearch, { params: { page, size,search: search || undefined, }, });
} 



const Get_DownloadPoDetail = `${url}/Podeatil/download-excel`;
export const downloadPoDetail = () => 
  axios.get(Get_DownloadPoDetail, {
    responseType: "blob", // 👈 essential for binary Excel files
  });

    const Get_DownloadSearchPoDetail = `${url}/Podeatil/download-excelSearch`;
export const downloadSearchPoDetail = (search) => 
  axios.get(Get_DownloadSearchPoDetail, {params:{search:search || undefined},
    responseType: "blob", // 👈 essential for binary Excel files
  });


  const getRcstore = `${url}/RcMain/getPageDatatyu`;
  export const fetchRc=()=>{return axios.get(getRcstore)}

  const getUserRole = `${url}/userAuth/fetchAllRoles`;
  export const fetchUserRole=()=>{return axios.get(getUserRole)}

   const getScreen = `${url}/userAuth/fetchScreen`;
  export const fetchScreenName=()=>{return axios.get(getScreen)}