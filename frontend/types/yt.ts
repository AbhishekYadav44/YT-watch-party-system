export type YTPlayer = {
    playVideo: () => void;
    pauseVideo: () => void;
    loadVideoById: (videoId: string) => void;
    getCurrentTime: () => number;
    destroy: () => void;
};

export type YouTubeAPI = {
    Player: new (
        element: HTMLElement,
        options: {
            videoId: string;
            playerVars?: Record<string, number>;
            events?: {
                onReady?: (event: { target: YTPlayer }) => void;
                onStateChange?: (event: {
                    data: number;
                    target: YTPlayer;
                }) => void;
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