import { PrismaClient } from "@prisma/client";
import { initContextCache } from "@pothos/core";
import { YogaInitialContext } from "@graphql-yoga/node";

export const prisma = new PrismaClient();

export const context = ({ request: req }: YogaInitialContext) => {
  return {
    ...initContextCache(),
    prisma,
    user: null,
    req,
  };
};
