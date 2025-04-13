import axios from "axios";
import { url } from '../app.config';

const Save_Product = `${url}/saveProduct`;
export const saveProductMaster = (formData) => axios.post(Save_Product, formData);

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

const Save_All = `${url}/saveProductsBulk`;
export const saveProductsBulk = (excelUploadData) => axios.post(Save_All, excelUploadData);


const Get_DownloadProduct = `${url}/download-excel`;
export const downloadProduct = () => 
  axios.get(Get_DownloadProduct, {
    responseType: "blob", // 👈 essential for binary Excel files
  });
const Login_Api = `${url}/login`
export const LoginUser = (formData) => axios.post(Login_Api, formData);

const Careate_Api = `${url}/createAccount`
export const CreateAccountUser = (formData) => axios.post(Careate_Api, formData);

const Save_RcMain = `${url}/RcMain/Save`;
export const saveMainMaterial = (formData) => axios.post(Save_RcMain, formData);

// Define the base URL for the DELETE endpoint
const Delete_product = `${url}/deleteProduct`;  // Base URL without the id

export const deleteproduct = (ids) => {
  const query = ids.map(id => `id=${id}`).join('&');
  return axios.delete(`${Delete_product}?${query}`);
};