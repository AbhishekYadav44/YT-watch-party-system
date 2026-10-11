"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Link2, Lock } from "lucide-react";

import type { YTPlayer, YouTubeWindow } from "@/types/yt";

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
    if (youtubeApiPromise) return youtubeApiPromise;

    youtubeApiPromise = new Promise((resolve, reject) => {
        const youtubeWindow = window as YouTubeWindow;

        if (youtubeWindow.YT?.Player) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";

        youtubeWindow.onYouTubeIframeAPIReady = () => resolve();
        script.onerror = () => reject(new Error("YouTube API failed to load"));

        document.head.appendChild(script);
    });

    return youtubeApiPromise;
}

function extractVideoId(url: string): string | null {
    try {
        const parsedUrl = new URL(url.trim());
        const hostname = parsedUrl.hostname.replace(/^www\./, "");

        if (hostname === "youtu.be") {
            return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
        }

        if (
            hostname === "youtube.com" ||
            hostname === "m.youtube.com" ||
            hostname === "youtube-nocookie.com"
        ) {
            if (parsedUrl.pathname === "/watch") {
                return parsedUrl.searchParams.get("v");
            }

            const match = parsedUrl.pathname.match(
                /^\/(embed|shorts|live)\/([^/]+)/
            );

            return match?.[2] ?? null;
        }

        return null;
    } catch {
        return null;
    }
}

type VideoSyncState = {
    videoId: string;
    currentTime: number;
    videoState: "playing" | "paused";
};

type VideoPlayerProps = {
    socket: React.RefObject<WebSocket | null>;
    videoState: VideoSyncState | null;
    canControl: boolean; 
    isHost: boolean; 
};

export default function VideoPlayer({
    videoState,
    socket,
    canControl,
    isHost,
}: VideoPlayerProps) {
    const [videoUrl, setVideoUrl] = useState("");
    const [playerReady, setPlayerReady] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState("Loading player...");

    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);

  
    const canControlRef = useRef(canControl);
    canControlRef.current = canControl;

    const applyingRef = useRef(false);
    const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isPlayingRef = useRef(false);

    const loadedVideoIdRef = useRef("");

    const hasVideo = !!videoState?.videoId;

    const sendToServer = (message: Record<string, unknown>) => {
        const ws = socket.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    };

  
    useEffect(() => {
        let cancelled = false;

        async function initializePlayer() {
            await loadYouTubeAPI();

            const youtubeWindow = window as YouTubeWindow;

            if (cancelled || !containerRef.current || !youtubeWindow.YT) {
                return;
            }

            const playerElement = document.createElement("div");
            containerRef.current.replaceChildren(playerElement);

            playerRef.current = new youtubeWindow.YT.Player(playerElement, {
                playerVars: {
                    controls: 1,
                    disablekb: 1,
                    playsinline: 1,
                    rel: 0,
                },

                events: {
                    onReady: () => {
                        if (cancelled) return;

                        setPlayerReady(true);
                        setPlaybackStatus("Waiting for a video");
                    },

                    onStateChange: (event) => {
                        const states = (window as YouTubeWindow).YT?.PlayerState;
                        if (!states) return;

                        if (event.data === states.PLAYING) {
                            isPlayingRef.current = true;
                            setPlaybackStatus("Playing");
                        } else if (event.data === states.PAUSED) {
                            isPlayingRef.current = false;
                            setPlaybackStatus("Paused");
                        } else if (event.data === states.ENDED) {
                            isPlayingRef.current = false;
                            setPlaybackStatus("Ended");
                        } else if (event.data === 5) {
                            isPlayingRef.current = false;
                            setPlaybackStatus("Ready");
                        }

                       
                        if (applyingRef.current) return;
                        if (!canControlRef.current) return;

                        const time = event.target.getCurrentTime();

                        if (event.data === states.PLAYING) {
                            sendToServer({ type: "play", currentTime: time });
                        } else if (event.data === states.PAUSED) {
                            sendToServer({ type: "pause", currentTime: time });
                        }
                    },

                    onError: (event : any) => {
                        console.error("YouTube error code:", event.data);
                        setPlaybackStatus(
                            "This video cannot be played here. Try another video."
                        );
                    },
                },
            });
        }

        initializePlayer().catch((error) => {
            console.error("YouTube player initialization failed:", error);

            if (!cancelled) {
                setPlaybackStatus("Could not load YouTube player");
            }
        });

        return () => {
            cancelled = true;
            playerRef.current?.destroy();
            playerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!canControl) return;

        const id = setInterval(() => {
            const player = playerRef.current;
            if (!player || !isPlayingRef.current) return;

            sendToServer({
                type: "time-update",
                currentTime: player.getCurrentTime(),
            });
        }, 3000);

        return () => clearInterval(id);
    }, [canControl]);

    useEffect(() => {
        const player = playerRef.current;

        if (!player || !playerReady || !videoState) return;

        if (!videoState.videoId) return;

        const targetId = videoState.videoId;
        const wantPlaying = videoState.videoState === "playing";

   
        let changed = false;

        if (loadedVideoIdRef.current !== targetId) {
            loadedVideoIdRef.current = targetId;
            changed = true;

            if (wantPlaying) {
                player.loadVideoById(targetId, videoState.currentTime);
            } else {
             
                player.cueVideoById(targetId, videoState.currentTime);
            }
        } else {
        
            const diff = Math.abs(
                player.getCurrentTime() - videoState.currentTime
            );
            if (diff > 2) {
                changed = true;
                player.seekTo(videoState.currentTime, true);
            }

            if (wantPlaying && !isPlayingRef.current) {
                changed = true;
                player.playVideo();
            } else if (!wantPlaying && isPlayingRef.current) {
                changed = true;
                player.pauseVideo();
            }
        }

        if (changed) {
            applyingRef.current = true;

            if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
            applyTimerRef.current = setTimeout(() => {
                applyingRef.current = false;
            }, 500);
        }
    }, [videoState, playerReady]);

    const handlePlayVideo = () => {
        if (!isHost) return;

        const id = extractVideoId(videoUrl);

        if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) {
            alert("Please enter a valid YouTube video URL.");
            return;
        }

      
        sendToServer({ type: "change-video", videoId: id });

        setVideoUrl("");
        setPlaybackStatus("Loading video...");
    };

    return (
        <section className="flex min-w-0 flex-col gap-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-lg shadow-black/40">
                <div
                    ref={containerRef}
                    className="aspect-video w-full [&_iframe]:h-full [&_iframe]:w-full"
                />

             
                {!hasVideo && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950 px-4 text-center text-sm text-gray-400">
                        {isHost
                            ? "Paste a YouTube URL below to start"
                            : "Waiting for the host to pick a video..."}
                    </div>
                )}

            
                {!canControl && (
                    <div className="absolute inset-0 z-10 cursor-not-allowed" />
                )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                {isHost ? (
                    <>
                        <label
                            htmlFor="youtube-url"
                            className="mb-3 block text-sm font-medium text-gray-300"
                        >
                            Play a YouTube video
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 focus-within:border-red-500">
                                <Link2 size={18} className="shrink-0 text-gray-500" />

                                <input
                                    id="youtube-url"
                                    type="url"
                                    value={videoUrl}
                                    onChange={(event) => setVideoUrl(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") handlePlayVideo();
                                    }}
                                    placeholder="Paste YouTube video URL..."
                                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handlePlayVideo}
                                disabled={!playerReady}
                                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Play size={17} fill="currentColor" />
                                Play Video
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Lock size={16} className="shrink-0" />
                        {canControl
                            ? "Only the host can change the video."
                            : "Only the host and moderators can control the video."}
                    </div>
                )}

                <p className="mt-3 text-xs text-gray-400">
                    Player status: {playbackStatus}
                </p>
            </div>
        </section>
    );
}