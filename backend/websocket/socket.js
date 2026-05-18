const { Server } = require("ws");
const messageController = require("../controllers/message.controller");

// Храним объекты пользователей: { ws, _id, username, avatar, teamId }
let onlineUsers = new Map();

const initSocket = (server) => {
    const wss = new Server({ server });

    wss.on("connection", (ws) => {
        console.log("User connected to WebSocket");

        ws.on("message", async (data) => {
            try {
                const msg = JSON.parse(data);

                // Когда пользователь заходит в комнату
                if (msg.type === "join_room") {
                    ws.teamId = msg.teamId;

                    if (msg.user) {
                        // Сохраняем соединение и полные данные пользователя
                        onlineUsers.set(ws, {
                            _id: msg.user._id,
                            username: msg.user.username,
                            avatar: msg.user.avatar,
                            teamId: msg.teamId
                        });
                    }
                    // Оповещаем комнату о новом составе онлайн-пользователей
                    broadcastOnlineUsers(wss, msg.teamId);
                }

                // Когда приходит новое сообщение
                if (msg.type === "message") {
                    // Используем наш контроллер для сохранения сообщения в MongoDB
                    const fullMessage = await messageController.saveWsMessage(
                        msg.teamId,
                        msg.userId,
                        msg.content
                    );

                    if (fullMessage) {
                        wss.clients.forEach((client) => {
                            if (
                                client.readyState === 1 && // 1 означает OPEN
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
                }
            } catch (err) {
                console.error("Ошибка обработки WS сообщения:", err);
            }
        });

        ws.on("close", () => {
            const userData = onlineUsers.get(ws);
            const teamId = userData ? userData.teamId : null;

            // Удаляем пользователя из онлайн-списка
            onlineUsers.delete(ws);

            // Если знали из какой он комнаты, обновляем список в ней
            if (teamId) {
                broadcastOnlineUsers(wss, teamId);
            }
            console.log("User disconnected");
        });
    });

    console.log("WebSocket running successfully");
};

// Функция отправляет список онлайн-пользователей только участникам конкретной комнаты
function broadcastOnlineUsers(wss, teamId) {
    const usersInRoom = [];

    onlineUsers.forEach((userData) => {
        if (userData.teamId === teamId) {
            // Чтобы не дублировать игроков, если открыто несколько вкладок
            if (!usersInRoom.some(u => u._id === userData._id)) {
                usersInRoom.push({
                    _id: userData._id,
                    username: userData.username,
                    avatar: userData.avatar
                });
            }
        }
    });

    wss.clients.forEach((client) => {
        if (client.readyState === 1 && client.teamId === teamId) {
            client.send(
                JSON.stringify({
                    type: "update_online_list", // Название типа синхронизировано с фронтендом
                    users: usersInRoom,
                })
            );
        }
    });
}

module.exports = { initSocket };