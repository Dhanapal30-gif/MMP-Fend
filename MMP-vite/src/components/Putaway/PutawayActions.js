import { fetchPutawayAll, fetchPutawayAllSearch, fetchPutawayPartially, fetchPutawayPending, putawayProcess, putawayReturningProcess } from "../../Services/Services-Rc";
import { fetchPutaway, fetchPutTicket, fetchRec } from "../../Services/Services_09";

export const fetchPutawayTicket = (setData) => {
  fetchPutTicket()
    .then((response) => setData(response.data.data))
    .catch((error) => {
      console.log("Error fetching PO number", error);
    });
};



export const fetchPutawayDetail = (page, size, setData, setTotalRows) => {
  fetchPutaway(page, size)
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

export const fetchPutawayPendingDetail = (page, size, setData, setTotalRows) => {
  fetchPutawayPending(page, size)
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

export const fetchPutawayPartiallyDetail = (page, size, setData, setTotalRows) => {
  fetchPutawayPartially(page, size)
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



export const fetchPutawayAllDetail = (page, size, setData, setTotalRows) => {
  fetchPutawayAll(page, size)
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


// putawayAction.js
export const PutawayProcessDetail = (ticketNo, setData, setTotalRows) => {
  // loading();
  putawayProcess(ticketNo)   // pass ticketNo to API
    .then((response) => {
      if (response?.data) {
        setData(response.data);
        // setTotalRows(response.data.length || 0);
      } else {
        console.warn("No content found:", response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching putaway data:", error);
    });
};

// putawayAction.js
export const PutawayReturningProcessDetail = (ticketNo, setData, setTotalRows) => {
  // loading();
  putawayReturningProcess(ticketNo)   // pass ticketNo to API
    .then((response) => {
      if (response?.data) {
        setData(response.data);
        // setTotalRows(response.data.length || 0);
      } else {
        console.warn("No content found:", response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching putaway data:", error);
    });
};

export const fetchPutawayAllDetailSearch = (page, size,search ="", setData, setTotalRows) => {
  fetchPutawayAllSearch(page, size,search)
    .then((response) => {
      if (response?.data?.content) {
        setData(response.data.content)
        setTotalRows(response.data.totalElements || 0);
      } else {
        console.warn("No content found in response:", response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching receiving data:", error);
    });
};