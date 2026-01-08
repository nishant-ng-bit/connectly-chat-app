import { uploadToCloudinary } from "../utils/cloudinary";
import fs from "fs";

export const uploader = async (file: Express.Multer.File) => {
  try {
    const res = await uploadToCloudinary(file.path);

    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Cloudinary upload failed");
  } finally {
    fs.unlinkSync(file.path);
  }
};
