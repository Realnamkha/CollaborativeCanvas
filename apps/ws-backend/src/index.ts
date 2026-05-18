import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET is not set");

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: Set<string>;
  userId: string;
}

interface MessageData {
  type: "join_room" | "leave_room" | "chat";
  roomId?: number;
  message?: string;
}

const users = new Map<WebSocket, User>();

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET!) as JwtPayload;
    return decoded?.userId ?? null;
  } catch {
    return null;
  }
}

function getUser(ws: WebSocket): User | undefined {
  return users.get(ws);
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) return ws.close();

  const token = new URLSearchParams(url.split("?")[1]).get("token") || "";
  const userId = checkUser(token);

  if (!userId) return ws.close();

  users.set(ws, { userId, rooms: new Set(), ws });

  ws.on("message", async function message(data) {
    try {
      const parsedData: MessageData = JSON.parse(data.toString());
      const user = getUser(ws);
      if (!user) return;

      if (parsedData.type === "join_room" && parsedData.roomId) {
        console.log("10");
        user.rooms.add(String(parsedData.roomId));
      }

      if (parsedData.type === "leave_room" && parsedData.roomId) {
        user.rooms.delete(String(parsedData.roomId));
      }

      if (
        parsedData.type === "chat" &&
        parsedData.roomId &&
        parsedData.message
      ) {
        console.log("1000");
        console.log("roomId:", parsedData.roomId, typeof parsedData.roomId);
        console.log("userId:", userId);

        const { roomId, message } = parsedData;

        try {
          const saved = await prismaClient.chat.create({
            data: {
              roomId,
              message,
              userId,
            },
          });
          console.log("Saved to DB:", saved); // ← add
        } catch (dbError) {
          console.error("Prisma error:", dbError); // ← separate DB catch
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    users.delete(ws);
  });
});
