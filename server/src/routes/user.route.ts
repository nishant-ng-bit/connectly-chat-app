import express from "express";
import {
  getUserByQueryHandler,
  setProfilePicHandler,
} from "../controllers/user.controller";
import multer from "multer";

const upload = multer({ dest: "tmp/" });
export const userRoute = (router: express.Router) => {
  router.get("/users/search", getUserByQueryHandler);
  router.post(
    "/user/profile",
    upload.single("profilePic"),
    setProfilePicHandler
  );
};
