const { Server } = require("ws");
const Message = require("../models/Message");

let onlineUsers = new Map();

const initSocket = (server) => {
    const wss = new Server({ server });

    wss.on("connection", (ws) => {
        console.log("User connected");

        ws.on("message", async (data) => {
            const msg = JSON.parse(data);

            if (msg.type === "online") {
                onlineUsers.set(msg.userId, ws);

                broadcastOnlineUsers(wss);
            }

            if (msg.type === "join_room") {
                ws.teamId = msg.teamId;
            }

            if (msg.type === "message") {
                const message = await Message.create({
                    sender: msg.userId,
                    team: msg.teamId,
                    content: msg.content,
                });

                const fullMessage = await message.populate("sender", "username avatar");

                wss.clients.forEach((client) => {
                    if (
                        client.readyState === 1 &&
                        client.teamId === msg.teamId
                    ) {
                        client.send(
                            JSON.stringify({
                                type: "new_message",
                                data: fullMessage,
                            })
                        );
                    }
                });
            }
        });

        ws.on("close", () => {
            onlineUsers.forEach((value, key) => {
                if (value === ws) onlineUsers.delete(key);
            });

            broadcastOnlineUsers(wss);
        });
    });

    console.log("WebSocket running");
};

function broadcastOnlineUsers(wss) {
    const users = Array.from(onlineUsers.keys());

    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(
                JSON.stringify({
                    type: "online_users",
                    users,
                })
            );
        }
    });
}

module.exports = { initSocket };