import { fetchRequestDetail, fetchSearchRequester } from "../../Services/Services-Rc";
import { fetchPutaway } from "../../Services/Services_09";

export const fetchRequesterDetail = (page,userId, perPage, setData, setTotalRows) => {
  fetchRequestDetail(page, perPage,userId)
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


// export const fetchRequesterSearch = (page,userId, size, setData,search , setTotalRows) => {
//           console.log("searchfetch", search);

//     fetchSearchRequester(page, size,userId,search )
//     .then((response) => {
//       if (response?.data?.content) {
//         setData(response.data.content)
//         setTotalRows(response.data.totalElements || 0);

//       }
//       else {
//         console.warn("No content found in response:", response.data);
//       }
//     }).catch((error) => {
//       console.error("Error fetching receiving data:", error);
//     });

// }

export const fetchRequesterSearch = (page, userId, size, search, setData, setTotalRows) => {
    return fetchSearchRequester(page, size, userId, search)
        .then((response) => {
            if (response?.data?.content) {
                setData(response.data.content);
                setTotalRows(response.data.totalElements || 0);
            } else {
                console.warn("No content found in response:", response.data);
            }
        })
        .catch((error) => {
            console.error("Error fetching receiving data:", error);
            throw error;
        });
};
