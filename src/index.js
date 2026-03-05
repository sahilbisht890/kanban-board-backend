const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./db/index");
const cors = require("cors");
const logger = require("./utils/logger");

dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://unique-kringle-2429b6.netlify.app"],
    credentials: true,
  }),
);

const userRouter = require("./routes/user.routes");
const boardRouter = require("./routes/board.routes");
const taskRouter = require("./routes/task.routes");

app.use("/api/auth", userRouter);
app.use("/api/boards", boardRouter);
app.use("/api/tasks", taskRouter);

connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      logger.info({ port }, "Server is running");
    });
  })
  .catch((err) => {
    logger.error({ err }, "MONGO db connection failed");
  });
