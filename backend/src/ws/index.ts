
import http from 'http'
import { WebSocketServer } from 'ws'
import { verifyToken } from '../utils/verifyToken.js';
import { Room } from './roomhandler.js';
export async function initws(server: http.Server) {

    const wss = new WebSocketServer({ server });
    const room = new Room();

    wss.on("connection", async (socket) => {
        console.log("WebSocket client connected!");
        let authenticatedUserId: string | null = null;

        socket.on('message', async(data) => {
            try {
                const message = JSON.parse(data.toString());

                try {
                    if (!authenticatedUserId) {


                        if (message.type !== "authenticate" || typeof message.token !== "string") {
                            socket.close(1008, "Authentication required");
                            return;
                        }
                        authenticatedUserId = verifyToken(message.token);

                        socket.send(JSON.stringify({
                            type: "authenticate",
                            message: "authentication succesful",
                            userId: authenticatedUserId
                        }))
                        return;
                    }
                } catch (e) {
                    socket.close(1008, "Invalid or expired token");
                    return;
                }
                if (authenticatedUserId === null) {
                    return;
                }

                console.log("Message received:", message);


               await room.handleEvent(socket , message, authenticatedUserId)

            } catch (e) {
                socket.close(1008, "something went wrong!");
            }
        })

        socket.on("close", () => {
            room.disconnectUser(socket)
        })

    })

}