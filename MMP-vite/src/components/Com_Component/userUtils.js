import { checkUserSession } from "../../Services/Services_09";

export const checkUserValid = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("passwordToken");

    // console.log("userId:", userId);
    // console.log("passwordToken:", token);

    if (!userId || !token) {
        return false; // no session
    }

    // Prepare payload
    const formData7 = {
        userId,
        passwordToken: token
    };

    try {
        const response = await checkUserSession(formData7);
        // Assuming backend returns { success: true/false }
        return response.data.success; 
    } catch (error) {
        console.error("Error validating user:", error);
        return false;
    }
};
