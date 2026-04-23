import { useEffect, useState } from "react";
import { WS_URL, BACKEND_URL } from "../config";
import axios from "axios";

export function useSocket() {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/me`, { withCredentials: true })
      .then((res) => {
        const token = res.data.token;

        if (!token) {
          console.error("No token received from /me");
          return;
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
          console.log("WebSocket connected ✅");
          setLoading(false);
          setSocket(ws);
        };

        ws.onerror = (e) => {
          console.error("WebSocket error:", e);
        };

        ws.onclose = (e) => {
          console.log("WebSocket closed:", e.code, e.reason);
        };

        // Cleanup on unmount
        return () => ws.close();
      })
      .catch((err) => {
        console.error("Failed to get token:", err);
      });
  }, []);

  return { loading, socket };
}
