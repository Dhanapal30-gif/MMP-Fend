import { downloadRecevingDetail, downloadSearchRecDetail, fetchPoDetail, fetchPonumber, fetchRec, fetchRecTicketNo, getRecDetailFind } from "../../Services/Services_09";

export const fetchPoNumberData = (setData) => {
  fetchPonumber()
    .then((response) => {
      setData(response.data); 
    })
    .catch((error) => {
      console.log("Error fetching PO number", error); 
    });
};

export const fetchPoDeatil=(setData)=>{
    fetchPoDetail().then((response)=>{
        setData(response.data);
    })
    .catch((error) => {
      console.log("Error fetching PO number", error); 
    });

}

// export const fetchReceving = (setDataCallback, setTotalRows, page = 1, size = 10) => {
//   fetchRec(page - 1, size)
//     .then((response) => {
//       if (response?.data?.content) {
//         setDataCallback(response.data.content);
//         setTotalRows(response.data.totalElements || 0);
//       } else {
//         console.warn("No content found in response:", response.data);
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching receiving data:", error);
//        setData([]);
//     setTotalRows(0);
//           throw error; // propagate so caller knows API didn't finish

//     });
// };


export const fetchReceving = (setDataCallback, setTotalRows, page = 1, size = 10) => {
  // return the promise so the caller can await it
  return fetchRec(page - 1, size)
    .then((response) => {
      if (response?.data?.content) {
        setDataCallback(response.data.content);
        setTotalRows(response.data.totalElements || 0);
      } else {
        setDataCallback([]);
        setTotalRows(0);
        console.warn("No content found in response:", response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching receiving data:", error);
      setDataCallback([]);
      setTotalRows(0);
      throw error; // propagate error
    });
};


// recvingAction.js
export const fetchfind = (setDataCallback, setTotalRows, page = 1, size = 10, search = "") => {
  return getRecDetailFind(page - 1, size, search)
    .then((response) => {
      if (response?.data?.content) {
        setDataCallback(response.data.content);
        setTotalRows(response.data.totalElements || 0);
      } else {
        console.warn("No content found in response:", response.data);
      }
    })
    .catch((error) => {
      setData([]);
    setTotalRows(0);
    throw error; // propagate so caller knows API didn't finish
    });
};


export const fetchRecevingData = (setData) => {
  fetchRecTicketNo()
    .then((response) => {
      setData(response.data); 
    })
    .catch((error) => {
      console.log("Error fetching PO number", error); 
    });
};

export const download = (search = "") => {
    
    if (search && search.trim() !== "") {
          setLoading(true);
          downloadSearchRecDetail(search) // <- pass search here
            .then((response) => {
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", "Receving.xlsx");
              document.body.appendChild(link);
              link.click();
              link.remove();
            })
            .catch((error) => {
              console.error("Download failed:", error);
            })
            .finally(() => {
              setLoading(false);
            });
        }
    else{
      downloadRecevingDetail()
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "Receving.xlsx");
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch((error) => {
          console.error("Download failed:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } 
  }

