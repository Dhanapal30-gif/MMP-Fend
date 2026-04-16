import { fetchPoStatus, fetchPoStatusSummary } from "../../Services/Services_09";


export const fetchPoStatusData = (setData, year, status, ponumber, partcode, page, size) => {
  fetchPoStatus({ year, status, ponumber, partcode, page, size })
    .then((response) => setData(response.data))
    .catch((error) => {
      // console.error(error);
    });
};


export const PoSummaryStatusData = (setData, year, status, ponumber, partcode, page, size) => {
  fetchPoStatusSummary({ year, status, ponumber, partcode, page, size })
    .then((response) => setData(response.data))
    .catch((error) => {
      // console.error(error);
    });
};
