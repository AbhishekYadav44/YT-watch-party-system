"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import RoomHeader from "@/app/components/RoomHeader";
import VideoPlayer from "@/app/components/VideoPlayer";
import RoomSidebar, { type Participant } from "@/app/components/RoomSidebar";
import axios from "axios";

type Role = "host" | "moderator" | "participant" | "viewer";

type VideoSyncState = {
    videoId: string;
    currentTime: number;
    videoState: "playing" | "paused";
};

type ServerMessage = {
    type: string;
    message?: string;
    userId?: string;
    targetedUserId?: string;
    username?: string;
    role?: Role;
    participants?: Participant[];
    videoId?: string;
    currentTime?: number;
    videoState?: "playing" | "paused";
    time?: number;
    roomId?: string;
};

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

export default function RoomClient({ roomId }: { roomId: string }) {
    const router = useRouter();
    const socketRef = useRef<WebSocket | null>(null);
    const leavingRef = useRef(false);
    const userIdRef = useRef<string | null>(null);

    const [myRole, setMyRole] = useState<Role>("participant");
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [videoState, setVideoState] = useState<VideoSyncState | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const sendMessage = useCallback((message: Record<string, unknown>) => {
        const ws = socketRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected");
            return false;
        }

        ws.send(JSON.stringify(message));
        return true;
    }, []);

    const handleAuthenticated = async (data: ServerMessage) => {
        if (!data.userId) {
            setErrorMessage("Authentication response did not include userId.");
            return;
        }

        setIsAuthenticated(true);
        userIdRef.current = data.userId;

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setErrorMessage("Authentication token not found.");
                return;
            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/room/join`,
                { roomId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const sent = sendMessage({ type: "join-room", roomId });

            if (!sent) {
                setErrorMessage("WebSocket is not connected.");
            }
        } catch (error) {
            console.error("Failed to join room:", error);

            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? "Failed to join room."
                );
            } else {
                setErrorMessage("An unexpected error occurred while joining.");
            }
        }
    };

    const handleJoinedRoom = (data: ServerMessage) => {
        setIsJoined(true);
        setErrorMessage(null);
        setMyRole(data.role ?? "participant");

        sendMessage({ type: "sync-state" });
    };

    const handleSyncState = (data: ServerMessage) => {
        if (
            typeof data.videoId !== "string" ||
            typeof data.currentTime !== "number" ||
            (data.videoState !== "playing" && data.videoState !== "paused")
        ) {
            console.warn("Invalid sync-state payload:", data);
            return;
        }

        setVideoState({
            videoId: data.videoId,
            currentTime: data.currentTime,
            videoState: data.videoState,
        });
    };

    const handleRoleChange = (
        targetUserId: string,
        role: "moderator" | "participant"
    ) => {
        sendMessage({
            type: "assign-role",
            targetUserId,
            role,
        });
    };
    const handleRemoveParticipant = (targetedUserId: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this participant?"
        );

        if (!confirmed) return;

        sendMessage({
            type: "remove-participant",
            targetedUserId,
        });
    };
    const handleParticipants = (data: ServerMessage) => {
        console.log("Participants message received:", data);

        if (!Array.isArray(data.participants)) {
            console.warn("Participants data missing or invalid:", data);
            return;
        }

        setParticipants(data.participants);

    };


    const handleRoleAssigned = (data: ServerMessage) => {
        if (!data.targetedUserId || !data.role) return;

        if (data.targetedUserId === userIdRef.current) {
            setMyRole(data.role);
        }
    };

    const leaveAndRedirect = () => {
        leavingRef.current = true;

        socketRef.current?.close();
        socketRef.current = null;

        setIsJoined(false);
        router.replace("/");
    };

    const handleServerMessage = (data: ServerMessage) => {
        if (data.type === "authenticate") {
            handleAuthenticated(data);
        } else if (data.type === "join-room") {
            handleJoinedRoom(data);
        } else if (data.type === "left-room") {
            leaveAndRedirect();
        } else if (data.type === "sync-state") {
            handleSyncState(data);
        } else if (data.type === "participants") {
            handleParticipants(data);
        } else if (data.type === "role-assigned") {
            handleRoleAssigned(data);
        } else if (data.type === "removed-from-room") {
            leaveAndRedirect();
        } else if (data.type === "error") {
            setErrorMessage(data.message ?? "An unknown server error occurred.");
        }
    };

    const handleLeaveRoom = () => {
        if (leavingRef.current) return;

        const ws = socketRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            leaveAndRedirect();
            return;
        }

        leavingRef.current = true;

        const sent = sendMessage({ type: "left-room" });

        if (!sent) {
            leavingRef.current = false;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.replace("/signin");
            return;
        }

        let ws: WebSocket;

        try {
            ws = new WebSocket(WS_URL);
            socketRef.current = ws;
        } catch (error) {
            console.error("Failed to create WebSocket:", error);
            setErrorMessage("Unable to connect to the server.");
            return;
        }

        ws.onopen = () => {
            setIsConnected(true);
            ws.send(JSON.stringify({ type: "authenticate", token }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as ServerMessage;
                handleServerMessage(data);
            } catch (error) {
                console.error("Invalid WebSocket message:", error);
            }
        };

        ws.onerror = (event) => {
            console.error("WebSocket error event:", event);
            console.error("WebSocket URL:", WS_URL);
            console.error("WebSocket readyState:", ws.readyState);
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed:", {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
            });

            setIsConnected(false);
            setIsAuthenticated(false);
            setIsJoined(false);

            if (socketRef.current === ws) {
                socketRef.current = null;
            }
        };

        return () => {
            if (socketRef.current === ws) {
                socketRef.current = null;
            }

            if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
            ) {
                ws.close();
            }
        };
    }, [roomId, router, sendMessage]);

    const isHost = myRole === "host";
    const canControl = myRole === "host" || myRole === "moderator";

    return (
        <main className="min-h-screen bg-black text-white">
            <RoomHeader
                roomId={roomId}
            // onLeave={handleLeaveRoom}
            />

            {errorMessage && (
                <div
                    role="alert"
                    className="mx-auto mt-4 max-w-[1600px] px-4 text-sm text-red-400 sm:px-6"
                >
                    {errorMessage}
                </div>
            )}

            <div className="mx-auto flex max-w-[1600px] flex-wrap gap-3 px-4 pt-4 text-xs text-gray-400 sm:px-6">
                <span>WebSocket: {isConnected ? "Connected" : "Disconnected"}</span>
                <span>Authentication: {isAuthenticated ? "Verified" : "Pending"}</span>
                <span>Room: {isJoined ? "Joined" : "Not joined"}</span>
            </div>

            <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <VideoPlayer
                    socket={socketRef}
                    videoState={videoState}
                    canControl={canControl}
                    isHost={isHost}
                />

                <div className="min-w-0">
                    <RoomSidebar participants={participants}
                        isHost={isHost}
                        currentUserId={userIdRef.current}
                        onRoleChange={handleRoleChange}
                        onRemoveParticipant={handleRemoveParticipant}
                    />
                </div>
            </div>
        </main>
    );
}