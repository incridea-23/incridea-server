import bcrypt from "bcryptjs";
import { prisma } from "../utils/db/prisma";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export function createUserByEmailAndPassword(user: {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  collegeId: number;
}) {
  user.password = bcrypt.hashSync(user.password, 12);
  return prisma.user.create({
    data: { ...user },
  });
}

export function findUserById(id: number) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}
