"use client";

import { useState } from "react";
import { FaYoutube } from "react-icons/fa";
import { Copy, Check, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type RoomHeaderProps = {
    roomId: string;
};

export default function RoomHeader({ roomId }: RoomHeaderProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleCopyInvite = async () => {
        try {
            const inviteLink = `${window.location.origin}/room/${roomId}`;
            await navigator.clipboard.writeText(inviteLink);

            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy invite link:", error);
        }


    };

    const handleLeaveRoom = () => {
        router.push("/");
    };

    return (
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-black/80 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-2"> <FaYoutube className="text-3xl text-red-600" />

                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Watch<span className="text-red-500">Party</span>
                </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-xs text-gray-400">ROOM CODE</p>
                    <p className="text-sm font-semibold tracking-wider text-white">
                        {roomId}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCopyInvite}
                    className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-white transition hover:border-red-500 hover:bg-red-500/10"
                >
                    {copied ? (
                        <Check size={16} className="text-green-500" />
                    ) : (
                        <Copy size={16} />
                    )}
                    {copied ? "Copied!" : "Copy Invite"}
                </button>

                <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                    <LogOut size={16} />
                    Leave
                </button>
            </div>
        </header>

    );
}
