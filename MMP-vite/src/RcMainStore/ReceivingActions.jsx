import { fetchPoDetail, fetchPonumber, fetchRec } from "../ServicesComponent/Services_09";

export const fetchPoNumberData = (setData) => {
  fetchPonumber()
    .then((response) => {
      setData(response.data); // ✅ fixed typo: "content"
    })
    .catch((error) => {
      console.log("Error fetching PO number", error); // ✅ fixed catch
    });
};


export const fetchPoDeatil=(setData)=>{
    fetchPoDetail().then((response)=>{
        setData(response.data);
    })
    .catch((error) => {
      console.log("Error fetching PO number", error); // ✅ fixed catch
    });

}

export const fetchReceving = (setDataCallback, setTotalRows, page = 1, size = 10) => {
  fetchRec(page - 1, size)
    .then((response) => {
      if (response?.data?.content) {
        setDataCallback(response.data.content);
        setTotalRows(response.data.totalElements || 0);
      } else {
        console.warn("No content found in response:", response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching receiving data:", error);
    });
};




