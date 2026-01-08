import prisma from "../lib/prisma";
import { uploader } from "./uploader.service";
interface user {
  username: string;
  email: string;
  password?: string;
}
export const createUser = async ({ username, email, password }: user) => {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      status: "Hi! I'm using Connectly",
    },
  });

  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

export const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user;
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return null;
  }
  return user;
};

export const getUserByQuery = async (username: string) => {
  if (!username || username.trim().length === 0) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      username: {
        startsWith: username.trim(),
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
    },
    take: 10,
  });
};

export const setProfilePic = async (
  userId: string,
  file: Express.Multer.File
) => {
  const res = await uploader(file);
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePic: res.secure_url,
    },
  });

  return updatedUser;
};
