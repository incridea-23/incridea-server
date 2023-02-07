import { YogaInitialContext } from "@graphql-yoga/node";
import { type PrismaClient } from "@prisma/client";
import { JwtPayload, verify } from "jsonwebtoken";

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
        process.env.JWT_ACCESS_SECRET as string
      ) as JwtPayload;

      const userId = tokenPayload.userId;

      return await prisma.user.findUnique({ where: { id: userId } });
    } catch (error) {
      return null;
    }
  }
  return null;
}
