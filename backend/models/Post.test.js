const mongoose = require("mongoose");
const Post = require("../models/Post");

describe("Post Model Validation", () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockTeamId = new mongoose.Types.ObjectId();

    it("Должен успешно проходить валидацию, если заполнены все обязательные поля публикации", () => {
        const validPost = new Post({
            title: "Грандиозный финал CYBER_NET СНГ",
            content: "Матч между Spirit и Falcons завершился победой драконов.",
            author: mockUserId,
            image: "https://cybernet.com/banner.jpg",
            tags: ["Киберспорт", "Spirit"],
            likes: [mockUserId]
        });

        const error = validPost.validateSync();
        expect(error).toBeUndefined();
    });

    it("Должен выбросить ошибку валидации, если у поста нет заголовка (title)", () => {
        const invalidPost = new Post({
            content: "Текст новости без темы",
            author: mockUserId
        });

        const error = invalidPost.validateSync();
        expect(error).toBeDefined();
        expect(error.errors.title).toBeDefined();
    });

    it("Должен позволять создавать пост как с привязкой к команде (team), так и без неё", () => {
        const globalPost = new Post({
            title: "Общее объявление для всех",
            content: "Технические работы на платформе завершены.",
            author: mockUserId
        });

        const teamPost = new Post({
            title: "Анонс состава",
            content: "Наш новый ростер на квалификации.",
            author: mockUserId,
            team: mockTeamId // Передаем ID команды
        });

        expect(globalPost.validateSync()).toBeUndefined();
        expect(teamPost.validateSync()).toBeUndefined();
    });
});