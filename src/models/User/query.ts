import { builder } from "../../builder";

builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.user.findMany();
    },
  })
);
