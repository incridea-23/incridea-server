import { builder } from "../../builder";

builder.queryField("winnersByEvent", (t) =>
  t.prismaField({
    type: ["Winners"],
    errors: {
      types: [Error],
    },
    args: {
      eventId: t.arg.id({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      return ctx.prisma.winners.findMany({
        where: {
          eventId: Number(args.eventId),
        },
        ...query,
      });
    },
  })
);
