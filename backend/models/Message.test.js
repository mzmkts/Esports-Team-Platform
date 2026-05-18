const mongoose = require("mongoose");
const Message = require("./Message"); // Проверь правильность пути к модели у себя

describe("Message Model Validation", () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockTeamId = new mongoose.Types.ObjectId();

    it("Должен успешно валидировать корректное сообщение чата со всеми полями", () => {
        const validMessage = new Message({
            sender: mockUserId,
            team: mockTeamId,
            content: "Парни, заходим в игру, пракк начинается!",
            attachments: [
                {
                    url: "https://cybernet.com/strat.png",
                    type: "image"
                }
            ],
            readBy: [mockUserId]
        });

        const error = validMessage.validateSync();
        expect(error).toBeUndefined();
    });

    it("Должен выдать ошибку, если отсутствует текст сообщения (content)", () => {
        const invalidMessage = new Message({
            sender: mockUserId,
            team: mockTeamId
        });

        const error = invalidMessage.validateSync();
        expect(error).toBeDefined();
        expect(error.errors.content).toBeDefined();
        expect(error.errors.content.kind).toBe("required");
    });

    it("Должен выдать ошибку, если не привязана комната команды (team)", () => {
        const invalidMessage = new Message({
            sender: mockUserId,
            content: "Обычный текст"
        });

        const error = invalidMessage.validateSync();
        expect(error).toBeDefined();
        expect(error.errors.team).toBeDefined();
    });
});