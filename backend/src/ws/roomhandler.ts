import type { string } from "zod";
import roomModel from "../models/roomModel.js";
import WebSocket from "ws";
export class Room {

      private rooms = new Map<string, Set<WebSocket>>();

      public async handleEvent(socket: WebSocket, message: any, userId: string) {
            console.log("Event:", message.type, "User:", userId);
            if (message.type == 'join-room') {
                  let roomId = message.roomId;
                  await this.joinRoom(socket, roomId, userId);
            } else if (message.type === 'left-room') {
                  this.disconnectUser(socket);
            }
      }

      private async joinRoom(socket: WebSocket, roomId: string, userId: string) {
            let room = await roomModel.findOne({ roomId });
            if (!room) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Room does not exist!"
                  }));
                  return;
            }

            let participant = room?.participants.find((p) => {
                  return p.user.toString() === userId
            })
            if (!participant) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "you can not be the part of this room"
                  }))
                  return;
            }

            let roomSockets = this.rooms.get(roomId);

            if (!roomSockets) {
                  roomSockets = new Set<WebSocket>();
                  this.rooms.set(roomId, roomSockets);
            }

            roomSockets.add(socket);

            socket.send(JSON.stringify({
                  type: "join-room",
                  message: "user joined!"
            }))
      }

      public disconnectUser(socket: WebSocket) {

            for (let [roomId, roomSockets] of this.rooms) {
                  if (roomSockets.has(socket)) {
                        roomSockets.delete(socket)
                  }
                  if (roomSockets.size === 0) {
                        this.rooms.delete(roomId);
                  }
            }

      }

}