"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoomClient({ roomId }: { roomId: string }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "authenticate",
          token,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("server message:", data);

        if (data.type === "authenticate") {
          ws.send(
            JSON.stringify({
              type: "join-room",
              roomId,
            })
          );
        }

        if (data.type === "join-room") {
          console.log("Successfully joined room:", roomId);
        }

        if (data.type === "error") {
          console.error("Room error:", data.message);
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
    };

    return () => {
      ws.close();
    };
  }, [roomId, router]);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-2xl font-bold">YouTube Watch Party</h1>

      <p className="mt-3 text-gray-300">
        Room ID: {roomId}
      </p>
    </main>
  );
}