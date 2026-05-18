import axios from "axios";
import { BACKEND_URL_SERVER } from "../../config";

export async function getExistingshapes(roomId: string) {
  const response = await axios.get(`${BACKEND_URL_SERVER}/chats/${roomId}`);
  const messages = response.data.messages;
  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
