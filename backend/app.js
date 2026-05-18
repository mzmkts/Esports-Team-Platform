require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const teamRoutes = require("./routes/team.routes");
const postRoutes = require("./routes/post.routes");
const messageRoutes = require("./routes/message.routes");
const { createRouteHandler } = require("uploadthing/express");

const app = express();

app.use(cors({ origin: '*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);


module.exports = app;