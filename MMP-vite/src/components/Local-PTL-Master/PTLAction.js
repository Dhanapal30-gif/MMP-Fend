export const savePTL = () => {
  fetchPoStatus()
    .then((response) => setData(response.data.message))
    .catch((error) => {
      // console.error(error);
    });
};