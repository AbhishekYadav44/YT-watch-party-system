
export type YTPlayer = {
    playVideo: () => void;
    pauseVideo: () => void;

    loadVideoById: (
        videoId: string,
        startSeconds?: number
    ) => void;

    cueVideoById: (
        videoId: string,
        startSeconds?: number
    ) => void;

    seekTo: (
        seconds: number,
        allowSeekAhead: boolean
    ) => void;

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
                onReady?: (event: {
                    target: YTPlayer;
                }) => void;

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
        CUED: number;
    };
};

export type YouTubeWindow = Window & {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
};
