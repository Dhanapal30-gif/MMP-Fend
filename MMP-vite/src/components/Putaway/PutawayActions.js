import { fetchPutaway, fetchPutTicket, fetchRec } from "../../Services/Services_09";

export const fetchPutawayTicket= (setData) => {
  fetchPutTicket()
    .then((response) => setData(response.data.data))
    .catch((error) => {
      console.log("Error fetching PO number", error); 
    });
};



export const fetchPutawayDetail = (page, size, setData) => {
  fetchPutaway(page, size)
    .then((response) => setData(response.data))
    .catch((error) => {
      // console.error(error);
    });
};
