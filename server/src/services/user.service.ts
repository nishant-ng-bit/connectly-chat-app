import prisma from "../lib/prisma";

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
