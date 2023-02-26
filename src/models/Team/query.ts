import { builder } from "../../builder";

builder.queryField("teamsByRound", (t) =>
  t.prismaField({
    type: ["Team"],
    args: {
      roundNo: t.arg({
        type: "Int",
        required: true,
      }),
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.team.findMany({
        where: {
          roundNo: {
            gte: args.roundNo,
          },
          eventId: Number(args.eventId),
        },
        ...query,
      });
    },
  })
);
