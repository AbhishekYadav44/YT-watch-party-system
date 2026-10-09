import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,

        },

        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        participants: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },

                role: {
                    type: String,
                    enum: ["host", "moderator", "participant", "viewer"],
                    default: "participant",
                },
                isOnline: {
                    type: Boolean,
                    default: false
                }
            },
        ],

        currentVideoId: {
            type: String,
            default: "",
        },

        videosQueue: [
            {
                videoId: {
                    type: String,
                    required: true,
                },

                addedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const roomModel = mongoose.model("Room", roomSchema);

export default roomModel;