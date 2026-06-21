import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import indexRoute from "./routes/index.route";
import cors from "cors";
import { initSocket } from "./socket/index";
import http from "http";
import { ensureAIAssistantExists } from "./services/user.service";

dotenv.config();
const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URLS,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((origin) => origin!.split(","))
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
initSocket(server);

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, "0.0.0.0", async () => {
  console.log(`server started on port ${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);
  await ensureAIAssistantExists();
});

app.use("/", indexRoute());
