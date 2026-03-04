import React, { useState, useEffect, useRef } from 'react';
import ProductRepairQtyTextFiled from "../../components/ProductRepairQtyMaster/ProductRepairQtyTextFiled";
import StockTransferTable from "../../components/StockTransfer/StockTransferTable";
import { getProduct } from '../../Services/Services';

const ProductRepairQtyMaster = () => {

    const [storeProduct, setStoreProduct] = useState([]);
     const getFirstDayOfMonth = () => {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        return `${year}-${month}-01`;
    };
    const [formData, setFormData] = useState({
        productname: "",
        productgroup: "",
        productfamily: "",
        effectivedate: getFirstDayOfMonth()
        // effectivedate:""
    });



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    };

    useEffect(() => {
        fetchProduct();
    }, [])

    const fetchProduct = () => {
        getProduct()
            .then((response) => {
                setStoreProduct(response.data)
            })
    }


    return (
        <div className='ComCssContainer'>
            <div className='ComCssInput'>
                <div className='ComCssFiledName'>
                    <p>Product RepairQty Master</p>
                </div>
                 <ProductRepairQtyTextFiled
                        data={storeProduct}
                        formData={formData}
                        setFormData={setFormData}
                        handleChange={handleChange}
                    />
                <div className="ReworkerButton9">
                    <button className='ComCssSubmitButton'  >Submit</button>
                    <button className='ComCssClearButton'  >Clear</button>

                </div>
            </div>
        </div>
    )
}
export default ProductRepairQtyMaster