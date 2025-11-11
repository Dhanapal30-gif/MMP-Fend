import { fetchComDetail } from "../../Services/Services-Rc";

export const fetchCompatabilityDetail = (page, perPage,search, setData, setTotalRows) => {
  fetchComDetail(page, perPage,search)
    .then((response) => {
      if (response?.data?.content) {
        setData(response.data.content)
        setTotalRows(response.data.totalElements || 0);

      }
      else {
        console.warn("No content found in response:", response.data);
      }
    }).catch((error) => {
      console.error("Error fetching receiving data:", error);
    });

}