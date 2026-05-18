const generateToken = require("./generateToken");
const jwt = require("jsonwebtoken");

describe("Utility Function: generateToken", () => {
    it("5. Должен генерировать валидный JWT-токен, содержащий id пользователя в Payload", () => {
        process.env.JWT_SECRET = "supersecret2026";
        const userId = "60d07f1f113a344d44444444";

        const token = generateToken(userId);
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(userId);
    });
});