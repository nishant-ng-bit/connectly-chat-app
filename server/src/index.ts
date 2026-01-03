import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import indexRoute from "./routes/index.route";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

app.use("/", indexRoute());
