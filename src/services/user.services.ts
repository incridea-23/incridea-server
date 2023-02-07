import bcrypt from "bcryptjs";
import { prisma } from "../utils/db/prisma";

function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

function createUserByEmailAndPassword(user: {
  name: string;
  email: string;
  password: string;
}) {
  user.password = bcrypt.hashSync(user.password, 12);
  return prisma.user.create({
    data: { ...user },
  });
}

function findUserById(id: number) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
};
