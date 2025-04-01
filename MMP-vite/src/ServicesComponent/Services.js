import axios from "axios";
import { url } from '../app.config';

const Save_Product = `${url}/saveProduct`;
export const saveProductMaster = (formData) => axios.post(Save_Product, formData);

const Get_UserMailId = `${url}/getEmailId`;
export const getUserMailId = () => axios.get(Get_UserMailId);

const Get_ProductMasterData = `${url}/getProduct`;
export const getProductMasterData = (page = 0, size = 10) => {
    return axios.get(Get_ProductMasterData, { params: { page, size, },}); };
    const Update_Product = (id) => `${url}/updateProduct/${id}`;

    export const updateProduct = (id, formData) => {
      if (!id) {
        console.error("❌ Error: Missing ID for update request");
        return Promise.reject(new Error("Missing ID"));
      }
      return axios.put(Update_Product(id), formData);
    };
    