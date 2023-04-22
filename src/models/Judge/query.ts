import { builder } from "../../builder";

builder.queryField("eventByJudge", (t) =>
  t.prismaField({
    type: ["Event"],
    args: {
      organizerId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.event.findMany({
        where: {
          Rounds: {
            some: {
              Judges: {
                some: {
                  userId: Number(args.organizerId),
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
