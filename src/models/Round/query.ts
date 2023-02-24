import { builder } from "../../builder";

builder.queryField("rounds", (t) =>
  t.prismaField({
    type: ["Round"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.round.findMany({
        ...query,
      });
    },
  })
);
