const Message = require("../models/Message");

const getTeamMessages = async (req, res) => {
    try {
        const { teamId } = req.params;

        const messages = await Message.find({ team: teamId })
            .populate("sender", "username avatar") // Подтягиваем инфо об отправителе
            .sort({ createdAt: 1 }); // Сортируем от старых к новым

        return res.status(200).json(messages);
    } catch (err) {
        console.error("Ошибка в getTeamMessages:", err);
        return res.status(500).json({
            success: false,
            message: "Ошибка при получении истории сообщений"
        });
    }
};

const saveWsMessage = async (teamId, userId, content) => {
    try {
        const newMessage = await Message.create({
            team: teamId,
            sender: userId,
            content: content
        });

        // Возвращаем сообщение с заполненными данными юзера для рассылки клиентам
        return await Message.findById(newMessage._id).populate("sender", "username avatar");
    } catch (err) {
        console.error("Ошибка при сохранении WS сообщения в базу:", err);
        return null;
    }
};

module.exports = { getTeamMessages, saveWsMessage };