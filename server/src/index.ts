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
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

const server = http.createServer(app);
initSocket(server);

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`server started on port ${PORT}`);
});

app.use("/", indexRoute());
