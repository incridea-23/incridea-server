import { builder } from "../../builder";

builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.user.findMany({
        ...query,
      });
    },
  })
);

builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      return user;
    },
  })
);
