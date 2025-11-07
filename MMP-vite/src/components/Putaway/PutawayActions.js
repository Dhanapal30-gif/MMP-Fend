import { downloadPutaway, downloadPutawayAll, fetchPutawayAll, fetchPutawayAllSearch, fetchPutawayPartially, fetchPutawayPending, putawayProcess, putawayReturningProcess } from "../../Services/Services-Rc";
import { fetchPutaway, fetchPutTicket } from "../../Services/Services_09";

export const fetchPutawayTicket = (setData) => {
  fetchPutTicket()
    .then((response) => setData(response.data.data))
    .catch((error) => {
      console.log("Error fetching PO number", error);
    });
};



export const fetchPutawayCloseDetail = (page, size,search, setData, setTotalRows) => {
  fetchPutaway(page, size,search)
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

export const fetchPutawayPendingDetail = (page, size,search , setData, setTotalRows) => {
  fetchPutawayPending(page, size,search )
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

export const fetchPutawayPartiallyDetail = (page, size,search, setData, setTotalRows) => {
  fetchPutawayPartially(page, size,search)
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



// export const download = (search = "") => {
//     // console.log("searchTeaxt", search)
//     //setLoading(true);
    
//       downloadPutawayAll()
//         .then((response) => {
//           const url = window.URL.createObjectURL(new Blob([response.data]));
//           const link = document.createElement("a");
//           link.href = url;
//           link.setAttribute("download", "PutawayAll.xlsx");
//           document.body.appendChild(link);
//           link.click();
//           link.remove();
//         })
//         .catch((error) => {
//           console.error("Download failed:", error);
//         })
//         .finally(() => {
//           // setLoading(false);
//         });
    
//   }

// Modified download function
export const download = ({ hiddenButton, search = "" }) => {
    let apiCall;
  // console.log("download called with:", hiddenButton)
    if (hiddenButton === 'closed') {
        apiCall = downloadPutaway(search,"closed");
    }else if (hiddenButton === 'pending') {
        apiCall = downloadPutaway(search,"pending");
    }else if(hiddenButton ==="partial"){
        apiCall = downloadPutaway(search,"partial");
    } else {
        apiCall = downloadPutawayAll(search);
    }

    apiCall
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Putaway_${hiddenButton ? hiddenButton : "All"}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch((error) => {
            console.error("Download failed:", error);
        });
};