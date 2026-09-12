// import { checkUserSession } from "../../Services/Services_09";

// export const checkUserValid = async () => {
//     const userId = localStorage.getItem("userId");
//     const token = localStorage.getItem("passwordToken");

//     // console.log("userId:", userId);
//     // console.log("passwordToken:", token);

//     if (!userId || !token) {
//         return false; // no session
//     }

//     // Prepare payload
//     const formData7 = {
//         userId,
//         passwordToken: token
//     };

//     try {
//         const response = await checkUserSession(formData7);
//         // Assuming backend returns { success: true/false }
//         return response.data.success; 
//     } catch (error) {
//         console.error("Error validating user:", error);
//         return false;
//     }
// };


import { checkUserSession } from "../../Services/Services_09";

export const checkUserValid = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("passwordToken");

    if (!userId || !token) {
        return false; // genuinely no session — correct to invalidate
    }

    const formData7 = { userId, passwordToken: token };

    try {
        const response = await checkUserSession(formData7);
        return response.data.success;
    } catch (error) {
        console.error("Error validating user session:", error);

        // Only treat as "invalid session" if the server explicitly said so (401/403).
        // Anything else (network error, timeout, 500) should NOT log the user out.
        if (error.response && [401, 403].includes(error.response.status)) {
            return false;
        }

        // Network error, timeout, CORS, 500, etc. — don't punish the user for this.
        // Treat as "couldn't verify right now", not "session expired".
        return true;
    }
};