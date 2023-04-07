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

// check if user is in team for particular event and retrun team details
builder.queryField("myTeam", (t) =>
  t.prismaField({
    type: "Team",
    args: {
      eventId: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      const data = await ctx.prisma.team.findFirst({
        where: {
          eventId: Number(args.eventId),
          TeamMembers: {
            some: {
              userId: user.id,
            },
          },
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

//get all the teams of a particular event
builder.queryField("teamsByEvent", (t) =>
  t.prismaField({
    type: ["Team"],
    args: {
      eventId: t.arg({ type: "ID", required: true }),
    },
    resolve: async(query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if(user.role !== "ADMIN") throw new Error("No Permission");
      return ctx.prisma.team.findMany({
        where: {
          eventId: Number(args.eventId),
        },
        ...query,
      });
    }
  })
);
