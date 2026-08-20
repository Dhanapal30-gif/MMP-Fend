import axios from "axios";
import { url } from '../app.config';

const sendAiMessageUrl = `${url}/api/ai/chat`;

export const sendAiMessage = async (message, conversationId) => {

  const response = await axios.post(sendAiMessageUrl, {
    message,
    conversationId,
  });

  return response.data;
};


