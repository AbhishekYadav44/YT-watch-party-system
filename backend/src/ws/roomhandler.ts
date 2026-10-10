
import roomModel from "../models/roomModel.js";
import WebSocket from "ws";
export class Room {

      private rooms = new Map<string, Set<WebSocket>>();
      private socketsroom = new Map<WebSocket, string>();

      public async handleEvent(socket: WebSocket, message: any, userId: string) {
            console.log("Event:", message.type, "User:", userId);
            if (message.type == 'join-room') {
                  let roomId = message.roomId;
                  await this.joinRoom(socket, roomId, userId);
            } else if (message.type === 'left-room') {
                  this.disconnectUser(socket, userId);
            } else if (message.type === 'sync-state') {
                  await this.SyncState(socket);
            } else if (message.type === 'play') {
                  await this.playVideo(socket, userId);
            } else if (message.type === 'pause') {
                  await this.pauseVideo(socket, userId);
            } else if (message.type === 'seek') {
                  await this.seekVideo(socket, userId, message.currentTime);
            } else if (message.type === 'change-video') {
                  await this.changeVideo(socket, userId, message.videoId);
            } else if (message.type === 'assign-role') {
                  await this.assinRole(socket, userId, message.targetUserId , message.role);
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
            this.socketsroom.set(socket, roomId)

            for (let client of roomSockets) {
                  if (client === socket) {
                        continue;
                  } else {
                        client.send(JSON.stringify({
                              type: "user-joined",
                              message: "new uer joined",
                              userId
                        }))
                  }

            }

            socket.send(JSON.stringify({
                  type: "join-room",
                  message: "user joined!"
            }))
      }

      public disconnectUser(socket: WebSocket, userId: string) {
            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;
            let roomSockets = this.rooms.get(roomId)
            if (!roomSockets) {
                  return;
            }

            for (const client of roomSockets) {
                  if (client === socket) continue;

                  client.send(JSON.stringify({
                        type: "user-left",
                        message: "one user left the room!",
                        userId
                  }))

            }

            this.socketsroom.delete(socket);

            roomSockets.delete(socket);

            if (roomSockets.size === 0) {
                  this.rooms.delete(roomId);
            }

      }

      private async SyncState(socket: WebSocket) {
            const roomId = this.socketsroom.get(socket);

            if (!roomId) return;

            const room = await roomModel.findOne({ roomId });

            if (!room) return;

            const currentVideo = room.currentVideo!;
            let roomScokets = this.rooms.get(roomId);

            for (const client of roomScokets!) {
                  client.send(JSON.stringify({
                        type: "sync-state",
                        videoId: currentVideo.videoId,
                        currentTime: currentVideo.currentTime,
                        videoState: currentVideo.videoState
                  }));
            }


      }

      private async playVideo(socket: WebSocket, userId: string) {


            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            let room = await roomModel.findOne({ roomId });
            if (!room) return

            if (!room.currentVideo) return;

            const participant = room.participants.find(
                  p => p.user.toString() === userId
            );

            if (room.hostId.toString() !== userId && participant?.role !== "moderator") {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You cannot play the video"
                  }));
                  return;
            }

            room.currentVideo.videoState = "playing";
            await room.save()

            await this.SyncState(socket);
      }
      private async pauseVideo(socket: WebSocket, userId: string) {


            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            let room = await roomModel.findOne({ roomId });
            if (!room) return

            if (!room.currentVideo) return;

            const participant = room.participants.find(
                  p => p.user.toString() === userId
            );

            if (room.hostId.toString() !== userId && participant?.role !== "moderator") {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You cannot play the video"
                  }));
                  return;
            }

            room.currentVideo.videoState = "paused";
            await room.save()

            await this.SyncState(socket);
      }
      private async seekVideo(socket: WebSocket, userId: string, currentTime: number) {


            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            let room = await roomModel.findOne({ roomId });
            if (!room) return

            if (!room.currentVideo) return;

            const participant = room.participants.find(
                  p => p.user.toString() === userId
            );

            if (room.hostId.toString() !== userId && participant?.role !== "moderator") {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You cannot play the video"
                  }));
                  return;
            }

            room.currentVideo.currentTime = currentTime;
            await room.save()

            await this.SyncState(socket);
      }
      private async changeVideo(socket: WebSocket, userId: string, videoId: string) {

            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            let room = await roomModel.findOne({ roomId });
            if (!room) return

            if (!room.currentVideo) return;

            if (room.hostId.toString() !== userId) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You cannot chnage the video"
                  }));
                  return;
            }

            room.currentVideo.videoId = videoId;
            await room.save()

            await this.SyncState(socket);
      }
      private async assinRole(socket: WebSocket, userId: string, targetedUserId : string,  role: string) {

            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            let room = await roomModel.findOne({ roomId });
            if (!room) return


            if (room.hostId.toString() !== userId) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You cannot chnage the role"
                  }));
                  return;
            }

            let user = room.participants.find((p) => {
                  return p.user.toString() === targetedUserId;
            })
            if(!user)return;
            user.role = role as 'host' | 'moderator';
            await room.save();

            let roomSockets = this.rooms.get(roomId);

            for(const client of roomSockets!){
                  client.send(JSON.stringify({
                        type : 'role-assigned',
                        targetedUserId : targetedUserId,
                        role : role
                  }))
            }
      }

}