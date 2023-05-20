const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const chatroomRoutes = require("./routes/chatroom");
const messageRoutes = require("./routes/message");
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lalgaf5.mongodb.net/${process.env.DATABASE_NAME}?w=majority`;
const jwt = require("jsonwebtoken");
const app = express();
// const Message = require("./models/message");

//CORS Policy
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(bodyParser.json());
app.use(helmet());
app.use(compression());

app.use((error, req, res, next) => {
  logger.error(error);
  const status = error.statusCode;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

app.use("/user", userRoutes);
app.use("/chatroom", chatroomRoutes);

app.use("/message", messageRoutes);
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 20000 })
  .then((result) => {
    console.log("Mongodb Connected");
  })
  .catch((err) => {
    logger.error(err);
  });

const server = app.listen(process.env.PORT, () => {
  console.log("Server is running on :", process.env.PORT);
});

const Message = mongoose.model("Message");

const User = mongoose.model("User");

const { Server } = require("socket.io");
const io = new Server(server);

io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    socket.userId = payload.id;
    next();
  } catch (err) {
    console.log(err);
    next();
  }
});

io.on("connection", (socket) => {
  console.log("connected", socket.userId);

  socket.on("disconnect", () => {
    console.log("Disconnected: ", +socket.userId);
  });

  socket.on("joinRoom", (chatroomId) => {
    socket.join(chatroomId);
    console.log("A user joined chartoom : " + chatroomId);
  });

  socket.on("leaveRoom", (chatroomId) => {
    socket.leave(chatroomId);
    console.log("A user leaved chartoom : " + chatroomId);
  });
  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    if (message.trim().length > 0) {
      const user = await User.findOne({ _id: socket.userId });
      const newMessage = new Message({
        chatroom: chatroomId,
        user: socket.userId,
        message,
      });
      io.to(chatroomId).emit("newMessage", {
        message,
        name: user.name,
        userId: socket.userId,
      });
      await newMessage.save();
    }
  });
});
