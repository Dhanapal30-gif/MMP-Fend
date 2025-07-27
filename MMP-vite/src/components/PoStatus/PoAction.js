import { fetchPoStatus } from "../../Services/Services_09";


export const fetchPoStatusData = (setData, year, status, ponumber, partcode, page, size) => {
  fetchPoStatus({ year, status, ponumber, partcode, page, size })
    .then((response) => setData(response.data))
    .catch((error) => {
      // console.error(error);
    });
};
