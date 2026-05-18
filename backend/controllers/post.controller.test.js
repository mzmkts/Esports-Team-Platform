describe("Post Controller Route Handler (Mocked)", () => {
    let postController;
    let Post;

    beforeEach(() => {
        // Очищаем кэш модулей Jest, чтобы предотвратить влияние других тестов
        jest.resetModules();

        // Импортируем модули заново в чистом окружении
        postController = require("./post.controller");
        Post = require("../models/Post.js");
    });

    afterEach(() => {
        // Убираем все шпионы после каждого теста
        jest.restoreAllMocks();
    });

    it("6. Должен возвращать статус 200 и массив постов из базы данных", async () => {
        const mockPosts = [{ _id: "p1", title: "Spirit vs Falcons Финал", content: "Сессия" }];

        // Симулируем цепочку: .find().populate().populate().sort()
        const mockQuery = {
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockResolvedValue(mockPosts)
        };

        // Перехватываем метод find у чистой модели Post
        jest.spyOn(Post, "find").mockReturnValue(mockQuery);

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await postController.getPosts(req, res);

        // Проверяем, что ответ успешный и данные дошли до res.json
        expect(res.status).not.toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(mockPosts);
    });
});