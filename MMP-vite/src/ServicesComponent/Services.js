import axios from "axios";
import { url } from '../app.config';

//Login API
const Login_Api = `${url}/login`
export const LoginUser = (formData) => axios.post(Login_Api, formData);

const Careate_Api = `${url}/createAccount`
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


const Get_RcPartcode = `${url}/Bom/getPartcode`;
export const getPartcode = () => axios.get(Get_RcPartcode);

const Get_Product = `${url}/Bom/getProduct`;
export const getProduct = () => axios.get(Get_Product);
