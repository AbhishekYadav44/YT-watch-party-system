
import http from 'http'
import { WebSocketServer } from 'ws'
import { verifyToken } from '../utils/verifyToken.js';
export async function initws(server: http.Server) {

    const wss = new WebSocketServer({ server });

    wss.on("connection", async (socket) => {
        console.log("WebSocket client connected!");
        let authenticatedUserId: string | null = null;

        socket.once('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
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
            } catch (e) {
                socket.close(1008, "Invalid or expired token");
            }
        })

    })

}