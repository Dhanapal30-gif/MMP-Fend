import { deleteRecDetail, downloadRecevingDetail, downloadSearchRecDetail, fetchGRN, fetchGrnPendingDetail, fetchRec, Get_GRNPonumber, getRecDetailFind } from "../../Services/Services_09";

export const fetchPendingGrn = (setData, setShowErrorPopup) => {
  fetchGrnPendingDetail()
    .then((response) => {
      setData(response.data);
    })
    .catch((error) => {
    //   const msg = error?.response?.data?.message || "Error fetching data";
    //   setShowErrorPopup(msg);
    });
};


export const fetchGRNDetail = (setDataCallback, setTotalRows, page = 1, size = 10) => {
  fetchGRN(page - 1, size)
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

export const fetchfind = (setDataCallback, setTotalRows, page = 1, size = 10,search ="") => {
  getRecDetailFind(page - 1, size,search)
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


export const download = (search = "") => {
    console.log("searchTeaxt", search)
    //setLoading(true);
    if (search && search.trim() !== "") {
          // setLoading(true);
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
          // setLoading(false);
        });
    } 
  }


// export const fetchfindPo = (setDataCallback, setTotalRows, ponumber = "") => {
//   Get_GRNPonumber(ponumber)
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
//     });
// };

export const fetchfindPo = (setDataCallback, setTotalRows, ponumber, onSuccess) => {
  Get_GRNPonumber(ponumber)
    .then((response) => {
      const data = response?.data;
      if (data) {
        setDataCallback(data);
        setTotalRows(data.length || 0); // Assuming it returns array
        if (onSuccess) onSuccess(data); // Pass data to handler
      } else {
        console.warn("No data found in response:", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching PO data:", error);
    });
};

export const deleteRec = async () => {
      console.log("Selected rows to delete:", selectedRows); // ✅ Add this

  try {
    setConfirmDelete(false);
    console.log("Selected rows to delete:", selectedRows); // ✅ Add this

    const res = await deleteRecDetail(selectedRows); // selectedDeleteRows must be array or ID(s)

    setSuccessMessage(res.data.message || "Deleted successfully");
    setShowSuccessPopup(true);
    setSelectedDeleteRows([]);
    fetchPendingGrn(); // optional: refresh data after delete

  } catch (error) {
    const msg = error?.response?.data?.message || "Delete failed";
    // setErrorMessage(msg);
    // setShowErrorPopup(true);
  }
};
