import { initContextCache } from "@pothos/core";
import { YogaInitialContext } from "@graphql-yoga/node";
import { prisma } from "./utils/db/prisma";

export const context = ({ request: req }: YogaInitialContext) => {
  return {
    ...initContextCache(),
    prisma,
    user: null,
    req,
  };
};
