"use client";

import { Users, Crown, ShieldCheck, Circle } from "lucide-react";

export type Participant = {
    userId: string;
    name: string;
    role: "host" | "moderator" | "participant";
    isOnline: boolean;
};

type RoomSidebarProps = {
    participants: Participant[];
    isHost: boolean;
    currentUserId: string | null;
    onRoleChange: (
        targetUserId: string,
        role: "moderator" | "participant"
    ) => void;
};

export default function RoomSidebar({
    participants,
    isHost,
    currentUserId,
    onRoleChange,
}: RoomSidebarProps) {
    const onlineCount = participants.filter(
        (participant) => participant.isOnline
    ).length;

    return (
        <aside className="flex h-full min-h-[350px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                    <Users size={19} className="text-red-500" />

                    <h2 className="font-semibold text-white">
                        Participants
                    </h2>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                    {onlineCount} online
                </span>
            </div>


            <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {participants.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                            <Users
                                size={25}
                                className="text-gray-500"
                            />
                        </div>

                        <p className="text-sm font-medium text-gray-300">
                            No participants yet
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            Participants will appear here.
                        </p>
                    </div>
                ) : (
                    participants.map((participant) => (
                        <div
                            key={participant.userId}
                            className="flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-white/10 hover:bg-white/[0.03]"
                        >
                            {/* Avatar */}
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-purple-500/20 text-sm font-semibold text-white">
                                {participant.name
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase() || "U"}

                                <span
                                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 ${participant.isOnline
                                        ? "bg-green-500"
                                        : "bg-gray-500"
                                        }`}
                                />
                            </div>

                            {/* Name and role */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">
                                    {participant.name}
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                    {participant.role === "host" ? (
                                        <>
                                            <Crown
                                                size={12}
                                                className="text-amber-400"
                                            />
                                            <span className="text-xs text-amber-400">
                                                Host
                                            </span>
                                        </>
                                    ) : participant.role === "moderator" ? (
                                        <>
                                            <ShieldCheck
                                                size={12}
                                                className="text-blue-400"
                                            />
                                            <span className="text-xs text-blue-400">
                                                Moderator
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Circle
                                                size={8}
                                                className={
                                                    participant.isOnline
                                                        ? "fill-green-500 text-green-500"
                                                        : "fill-gray-500 text-gray-500"
                                                }
                                            />
                                            <span className="text-xs text-gray-400">
                                                Participant
                                            </span>
                                        </>
                                    )}
                                </div>
                                {isHost &&
                                    participant.userId !== currentUserId &&
                                    participant.role !== "host" && (
                                        <select
                                            value={participant.role}
                                            onChange={(e) =>
                                                onRoleChange(
                                                    participant.userId,
                                                    e.target.value as "moderator" | "participant"
                                                )
                                            }
                                            className="mt-2 rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-xs text-white"
                                        >
                                            <option value="participant">Participant</option>
                                            <option value="moderator">Moderator</option>
                                        </select>
                                    )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-4 py-3">
                <p className="text-center text-xs text-gray-500">
                    Watching together, from anywhere.
                </p>
            </div>
        </aside>
    );
}