
import { string } from "zod";
import roomModel from "../models/roomModel.js";
import WebSocket from "ws";
export class Room {

      private rooms = new Map<string, Map<WebSocket, string>>();
      private socketsroom = new Map<WebSocket, string>();
      private currentVideo = new Map<string, {
            videoId: string;
            videoState: "playing" | "paused";
            currentTime: number;
      }>();
      private roomPermissions = new Map<string,
            { hostId: string; moderators: Set<string> }
      >();

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
                  await this.assinRole(socket, userId, message.targetUserId, message.role);
            } else if (message.type === 'remove-participant') {
                  await this.removeParticipant(socket, userId, message.targetUserId);
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

            if (!this.roomPermissions.has(roomId)) {
                  this.roomPermissions.set(roomId, {
                        hostId: room.hostId.toString(),
                        moderators: new Set(
                              room.participants
                                    .filter(p => p.role === "moderator")
                                    .map(p => p.user.toString())
                        )
                  });
            }
            if (room.currentVideo && !this.currentVideo.has(roomId)) {
                  this.currentVideo.set(roomId, {
                        videoId: room.currentVideo.videoId,
                        videoState: room.currentVideo.videoState,
                        currentTime: room.currentVideo.currentTime
                  });
            }
            let roomSockets = this.rooms.get(roomId);

            if (!roomSockets) {
                  roomSockets = new Map<WebSocket, string>();
                  this.rooms.set(roomId, roomSockets);
            }

            roomSockets.set(socket, userId);
            this.socketsroom.set(socket, roomId)

            for (let [client, clientId] of roomSockets) {
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
            this.socketsroom.delete(socket);
            if (!roomSockets) {
                  return;
            }

            for (const [client, clientId] of roomSockets) {
                  if (client === socket) continue;

                  client.send(JSON.stringify({
                        type: "user-left",
                        message: "one user left the room!",
                        userId
                  }))

            }
            roomSockets.delete(socket);

            if (roomSockets.size === 0) {
                  this.rooms.delete(roomId);
            }

      }

      private SyncState(socket: WebSocket) {
            const roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            const video = this.currentVideo.get(roomId);
            if (!video) return;

            const roomSockets = this.rooms.get(roomId);
            if (!roomSockets) return;

            for (const [client, clientId] of roomSockets) {
                  if (client.readyState !== WebSocket.OPEN) continue;

                  client.send(JSON.stringify({
                        type: "sync-state",
                        videoId: video.videoId,
                        currentTime: video.currentTime,
                        videoState: video.videoState
                  }));
            }
      }

      private async playVideo(socket: WebSocket, userId: string) {


            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            const permissions = this.roomPermissions.get(roomId);

            if (!permissions) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Room permissions not found"
                  }));
                  return;
            }

            if (permissions.hostId !== userId && !permissions.moderators.has(userId)) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You don't have permission"
                  }));
                  return;
            }

            const video = this.currentVideo.get(roomId);
            if (!video) return;

            video.videoState = "playing";

            this.SyncState(socket);

      }
      private async pauseVideo(socket: WebSocket, userId: string) {


            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            const permissions = this.roomPermissions.get(roomId);

            if (!permissions) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Room permissions not found"
                  }));
                  return;
            }

            if (permissions.hostId !== userId && !permissions.moderators.has(userId)) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You don't have permission"
                  }));
                  return;
            }


            let video = this.currentVideo.get(roomId);
            if (!video) return;
            video.videoState = 'paused';
            this.SyncState(socket);
      }
      private async seekVideo(socket: WebSocket, userId: string, currentTime: number) {


            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            const permissions = this.roomPermissions.get(roomId);

            if (!permissions) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Room permissions not found"
                  }));
                  return;
            }

            if (permissions.hostId !== userId && !permissions.moderators.has(userId)) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You don't have permission"
                  }));
                  return;
            }


            let video = this.currentVideo.get(roomId);
            if (!video) return;
            video.currentTime = currentTime
            this.SyncState(socket);
      }
      private async changeVideo(socket: WebSocket, userId: string, videoId: string) {

            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            const permissions = this.roomPermissions.get(roomId);

            if (!permissions) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Room permissions not found"
                  }));
                  return;
            }

            if (permissions.hostId !== userId) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You don't have permission"
                  }));
                  return;
            }

            const video = this.currentVideo.get(roomId);
            if (!video) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Video state not found"
                  }));
                  return;
            }
            video.videoId = videoId
            video.currentTime = 0;
            video.videoState = 'paused'
            this.SyncState(socket);
      }
      private async assinRole(socket: WebSocket, userId: string, targetedUserId: string, role: string) {

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
            if (!user) return;
            user.role = role as 'host' | 'moderator';
            await room.save();
            const permissions = this.roomPermissions.get(roomId);

            if (permissions) {
                  if (role === "moderator") {
                        permissions.moderators.add(targetedUserId);
                  } else {
                        permissions.moderators.delete(targetedUserId);
                  }
            }

            let roomSockets = this.rooms.get(roomId);

            for (const [client, clientId] of roomSockets!) {
                  client.send(JSON.stringify({
                        type: 'role-assigned',
                        targetedUserId: targetedUserId,
                        role: role
                  }))
            }
      }
      private async removeParticipant(socket: WebSocket, userId: string, targetedUserId: string) {

            let roomId = this.socketsroom.get(socket);
            if (!roomId) return;

            let room = await roomModel.findOne({ roomId });
            if (!room) return

            if (room.hostId.toString() !== userId) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "You cannot remove partcipant"
                  }));
                  return;
            }
            if (targetedUserId === room.hostId.toString()) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Host cannot remove themselves"
                  }));
                  return;
            }


            const participantExists = room.participants.find((p) => {

                  return p.user.toString() === targetedUserId
            }
            );

            if (!participantExists) {
                  socket.send(JSON.stringify({
                        type: "error",
                        message: "Participant not found"
                  }));
                  return;
            }
            room.participants = room.participants.filter(
                  p => p.user.toString() !== targetedUserId
            ) as typeof room.participants;

            await room.save();
            this.roomPermissions.get(roomId)?.moderators.delete(targetedUserId);


            const roomSockets = this.rooms.get(roomId);

            if (roomSockets) {
                  for (const [client, clientId] of roomSockets) {
                        if (clientId !== targetedUserId) {
                              if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify({
                                          type: "participant-removed",
                                          targetedUserId
                                    }));
                              }

                              continue;
                        }
                        if (client.readyState === WebSocket.OPEN) {
                              client.send(JSON.stringify({
                                    type: "removed-from-room",
                                    message: "You have been removed from the room"
                              }));

                              client.close(1008, "Removed from room");
                        }

                        roomSockets.delete(client);
                        this.socketsroom.delete(client);
                  }
                  if (roomSockets.size === 0) {
                        this.rooms.delete(roomId);
                  }
            }

      }

}