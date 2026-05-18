const request = require("supertest");
const express = require("express");

jest.mock("../controllers/team.controller", () => ({
    createTeam: (req, res) => res.status(201).json({ success: true }),
    getTeams: (req, res) => res.status(200).json([{ _id: "t1", name: "Natus Vincere", game: "CS2" }]),
    getTeamById: (req, res) => res.status(200).json({ _id: "t1", name: "Natus Vincere" }),
    joinTeam: (req, res) => res.status(200).json({ success: true }),
    leaveTeam: (req, res) => res.status(200).json({ success: true }), // Добавили пропущенный метод
    deleteTeam: (req, res) => res.status(200).json({ success: true })  // Добавили пропущенный метод
}));

jest.mock("../middleware/auth.middleware", () => {
    return (req, res, next) => next();
}, { virtual: true });

const teamRoutes = require("./team.routes");

const app = express();
app.use(express.json());
app.use("/api/teams", teamRoutes);

describe("Teams API Endpoint Integration", () => {
    it("7. GET /api/teams должен возвращать статус 200 и массив в формате JSON", async () => {
        const response = await request(app)
            .get("/api/teams")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].name).toBe("Natus Vincere");
    });
});