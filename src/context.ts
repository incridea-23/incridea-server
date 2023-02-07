import { initContextCache } from "@pothos/core";
import { YogaInitialContext } from "@graphql-yoga/node";
import { prisma } from "./utils/db/prisma";
import { authenticateUser } from "./utils/auth/authenticateUser";

export const context = ({ request: req }: YogaInitialContext) => {
  return {
    ...initContextCache(),
    prisma,
    user: authenticateUser(prisma, req),
    req,
  };
};
