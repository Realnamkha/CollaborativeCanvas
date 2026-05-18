import { useEffect, useState } from "react";
import { WS_URL, BACKEND_URL } from "../config";
import axios from "axios";

export function useSocket(roomId: string) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    let ws: WebSocket;

    axios
      .get(`${BACKEND_URL}/me`, { withCredentials: true })
      .then((res) => {
        const token = res.data.token;
        if (!token) {
          console.error("No token received from /me");
          return;
        }

        ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
          console.log("WebSocket connected ✅");
          const msg = JSON.stringify({ type: "join_room", roomId });
          console.log("Sending:", msg); // ← add this
          ws.send(msg);
          setLoading(false);
          setSocket(ws);
        };

        ws.onerror = (e) => console.error("WebSocket error:", e);
        ws.onclose = (e) => console.log("WebSocket closed:", e.code, e.reason);
      })
      .catch((err) => console.error("Failed to get token:", err));

    return () => ws?.close(); // ✅ React sees this and calls it on unmount
  }, []);

  return { loading, socket };
}
