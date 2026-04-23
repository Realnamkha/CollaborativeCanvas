import axios from "axios";
import { BACKEND_URL, BACKEND_URL_SERVER } from "../../../config";
import { ChatRoom } from "../../components/ChatRoom";
import { cookies } from "next/headers";
import Canvas from "../../components/ChatRomClient";
async function getRoom(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value; // ← get cookie from Next.js

  const response = await axios.get(`${BACKEND_URL_SERVER}/room/${slug}`, {
    headers: {
      Cookie: `token=${token}`, // ← forward it to backend
    },
  });
  return response.data.room; // return full room, not just id
}

export default async function Room({ params }: { params: { slug: string } }) {
  const slug = (await params).slug;
  const room = await getRoom(slug);

  return (
    <div className="flex justify-center align-center">
      <Canvas />
    </div>
  );
}
