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
                    role: "host"
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