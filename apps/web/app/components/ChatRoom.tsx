import axios from "axios";
import { BACKEND_URL, BACKEND_URL_SERVER } from "../../config";
import { ChatRoomClient } from "./ChatRomClient";

async function getChats(roomId: string) {
  const response = await axios.get(`${BACKEND_URL_SERVER}/chats/${roomId}`);
  return response.data.messages;
}

export async function ChatRoom({ id }: { id: string }) {
  const messages = await getChats(id);

  return <ChatRoomClient messages={messages} id={id} />;
}
