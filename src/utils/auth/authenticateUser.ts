import { YogaInitialContext } from "@graphql-yoga/node";
import { type PrismaClient } from "@prisma/client";
import { JwtPayload, verify } from "jsonwebtoken";
import { secrets } from "./jwt";

export async function authenticateUser(
  prisma: PrismaClient,
  request: YogaInitialContext["request"]
) {
  const header = request.headers.get("authorization");
  if (header !== null) {
    try {
      const token = header.split(" ")[1];
      const tokenPayload = verify(
        token,
        secrets.JWT_ACCESS_SECRET as string
      ) as JwtPayload;

      const userId = tokenPayload.userId;

      return await prisma.user.findUnique({
        where: { id: userId },
        include: { College: true },
      });
    } catch (error) {
      return null;
    }
  }
  return null;
}
