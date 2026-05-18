const mongoose = require("mongoose");
const Team = require("../models/Team");

describe("Team Model Validation", () => {
    const mockUserId = new mongoose.Types.ObjectId();

    it("Должен успешно валидировать создание новой киберспортивной команды", () => {
        const validTeam = new Team({
            name: "Natus Vincere",
            logo: "https://cybernet.com/navi.png",
            description: "Ростер по дисциплине Counter-Strike 2",
            game: "CS2",
            owner: mockUserId,
            members: [mockUserId]
        });

        const error = validTeam.validateSync();
        expect(error).toBeUndefined();
    });

    it("Должен автоматически устанавливать лимит в 5 человек (maxMembers), если поле не передано", () => {
        const defaultTeam = new Team({
            name: "Virtus.Pro",
            owner: mockUserId
        });

        expect(defaultTeam.maxMembers).toBe(5); // Проверка дефолтного значения схемы

        const error = defaultTeam.validateSync();
        expect(error).toBeUndefined();
    });

    it("Должен отклонять регистрацию команды без владельца/капитана (owner)", () => {
        const invalidTeam = new Team({
            name: "Team Liquid",
            game: "Dota 2"
        });

        const error = invalidTeam.validateSync();
        expect(error).toBeDefined();
        expect(error.errors.owner).toBeDefined();
        expect(error.errors.owner.kind).toBe("required");
    });
});