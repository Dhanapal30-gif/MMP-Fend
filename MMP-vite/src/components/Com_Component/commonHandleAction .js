// commonHandleAction.js

export const commonHandleAction = ({
  e,
  formData,
  validate,
  selectedRows,
  submitButton,
  updateButton,
  submitData,
  submitApi,
  updateApi,
  buildUpdateData,
  setErrorMessage,
  setShowErrorPopup,
  handleSuccess,
  handleError,
}) => {
  e.preventDefault();

  if (!validate()) return;

  // if (selectedRows.length === 0) {
  //   setErrorMessage("Please select at least one item before submitting.");
  //   setShowErrorPopup(true);
  //   return;
  // }

  const username = sessionStorage.getItem("userName") || "System";

  if (submitButton) {
    const dataToSubmit =
      typeof submitData === "function"
        ? submitData(username)
        : selectedRows.map((row) => ({
            ...row,
            createdby: username,
            updatedby: username,
          }));


    submitApi(dataToSubmit).then(handleSuccess).catch(handleError);
  } else if (updateButton) {
    const updatePayload = buildUpdateData({ formData, username });
    updateApi(formData.id, updatePayload).then(handleSuccess).catch(handleError);
  } else {
    setErrorMessage("No action specified (Submit or Update).");
    setShowErrorPopup(true);
  }
};

export const handleSuccessCommon = ({
  response,
  setSuccessMessage,
  setShowSuccessPopup,
  afterSuccess,
}) => {
  console.log("Success response in handler:", response);
  const message = response?.data.message || "Success";
  setSuccessMessage(message);
  setShowSuccessPopup(true);

  if (typeof afterSuccess === "function") {
    afterSuccess(response);
  }
};


export const handleErrorCommon = ({
  error,
  setErrorMessage,
  setShowErrorPopup,
}) => {
  const msg = error?.response?.data?.message || "Something went wrong!";
  setErrorMessage(msg);
  setShowErrorPopup(true);
};
