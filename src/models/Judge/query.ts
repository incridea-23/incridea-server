import { builder } from "../../builder";

builder.queryField("eventByJudge", (t) =>
  t.prismaField({
    type: "Event",
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not authorized");
      }
      return await ctx.prisma.event.findFirstOrThrow({
        where: {
          Rounds: {
            some: {
              Judges: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
        ...query,
      });
    },
  })
);
