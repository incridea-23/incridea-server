import { builder } from "../../builder";

builder.queryField("teamsByRound", (t) =>
  t.prismaConnection({
    type: "Team",
    cursor: "id",
    args: {
      roundNo: t.arg({
        type: "Int",
        required: true,
      }),
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
      contains: t.arg.string({ required: false }),
    },
    resolve: (query, root, args, ctx, info) => {
      const filter = args.contains || "";
      return ctx.prisma.team.findMany({
        where: {
          roundNo: {
            gte: args.roundNo,
          },

          eventId: Number(args.eventId),
          confirmed: true,
          OR: [
            {
              name: {
                contains: filter,
              },
            },
            {
              TeamMembers: {
                some: {
                  User: {
                    OR: [
                      {
                        name: {
                          contains: filter,
                        },
                      },
                      {
                        email: {
                          contains: filter,
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
        ...query,
      });
    },
  })
);

builder.queryField("teamDetails", (t) =>
  t.prismaField({
    type: "Team",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const data = await ctx.prisma.team.findUnique({
        where: {
          id: Number(args.id),
        },
        ...query,
      });
      if (!data) {
        throw new Error("Team not found");
      }
      return data;
    },
  })
);
