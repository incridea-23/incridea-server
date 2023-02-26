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
      return ctx.prisma.team.findMany({
        where: {
          roundNo: {
            gte: args.roundNo,
          },
          confirmed: true,
          eventId: Number(args.eventId),
          OR: [
            {
              name: {
                contains: args.contains || undefined,
              },
            },
            {
              TeamMembers: {
                some: {
                  User: {
                    name: {
                      contains: args.contains || undefined,
                    },
                  },
                },
              },
            },
            {
              TeamMembers: {
                some: {
                  User: {
                    email: {
                      contains: args.contains || undefined,
                    },
                  },
                },
              },
            },
            {
              TeamMembers: {
                some: {
                  User: {
                    id: {
                      equals: Number(args.contains) || undefined,
                    },
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
