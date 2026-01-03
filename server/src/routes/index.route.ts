import express from "express";
import { messageRoute } from "./message.route";
import { authRoute } from "./auth.route";

const router = express.Router();

export default (): express.Router => {
  authRoute(router);
  messageRoute(router);
  return router;
};
