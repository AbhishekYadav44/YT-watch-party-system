import type { Request, Response } from "express"
import roomModel from "../models/roomModel.js";
import { randomBytes } from "crypto";

import { type CustomRequest } from "../types.js";

export async function createRoom(req: CustomRequest, res: Response) {

    try {

        if (!req.userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const roomId = randomBytes(4).toString("hex").toUpperCase();
        const hostId = req.userId;
        const newRoom = await roomModel.create({
            roomId: roomId,
            hostId: hostId,
            participants: [
                {
                    user: req.userId,
                    role: "host",
                    isOnline: true
                }
            ],
        })
        console.log(newRoom)
        res.json({
            message: "room created succesfully!",
            roomId
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Error while creating room",
        });
    }

}


export async function joinRoom(req: CustomRequest, res: Response) {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({
                message: "meetingId is required"
            });
        }

        const room = await roomModel.findOne({ roomId })
        if (!room) {
            return res.status(400).json({
                message: "meeting not exist"
            })
        }

        const participant = room.participants.find(
            (p) => p.user.toString() === req.userId
        );

        if (participant) {
            participant.isOnline = true;
        } else {
            room.participants.push({
                user: req.userId,
                role: "participant",
                isOnline: true,
            });
        }

        await room.save();

        return res.status(200).json({
            message: "Room joined successfully!",
            roomId: room.roomId,
        });


    } catch (e) {
        console.log(e)
        return res.status(400).json({
            message: "Try again or room does not exist!"
        })
    }
}