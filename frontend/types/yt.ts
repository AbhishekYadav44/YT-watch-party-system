export type YTPlayer = {
    destroy: () => void;
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => number;
    loadVideoById: (videoId: string, startSeconds?: number) => void;
    cueVideoById: (videoId: string, startSeconds?: number) => void;
};

export type YouTubeAPI = {
    Player: new (
        element: HTMLElement,
        options: {
            videoId?: string;
            playerVars?: Record<string, number>;
            events?: {
                onReady?: (event: { target: YTPlayer }) => void;
                onStateChange?: (event: {
                    data: number;
                    target: YTPlayer;
                }) => void;
                onError?: (event: { data: number }) => void;
            };
        }
    ) => YTPlayer;

    PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
    };
};

export type YouTubeWindow = Window & {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
};