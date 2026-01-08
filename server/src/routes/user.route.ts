import express from "express";
import {
  // deleteUserHandler,
  getUserByIdHandler,
  getUserByQueryHandler,
  setProfilePicHandler,
} from "../controllers/user.controller";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware";

const upload = multer({ dest: "tmp/" });
export const userRoute = (router: express.Router) => {
  router.get("/users/search", authMiddleware, getUserByQueryHandler);
  router.post(
    "/user/profile",
    authMiddleware,
    upload.single("profilePic"),
    setProfilePicHandler
  );
  router.get("/user/:userId", authMiddleware, getUserByIdHandler);
};
