import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import indexRoute from "./routes/index.route";
import cors from "cors";
import { initSocket } from "./socket/index";
import http from "http";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

app.use("/", indexRoute());
