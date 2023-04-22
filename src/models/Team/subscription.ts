import { builder } from "../../builder";

builder.queryField("judgeGetTeamsByRound", (t) =>
  t.prismaField({
    type: ["Team"],
    args: {
      eventId: t.arg.int({ required: true }),
      roundId: t.arg.int({ required: true }),
    },
    smartSubscription: true,
    subscribe: (subscription, root, args, ctx, info) => {
      subscription.register(`TEAM_UPDATED/${args.eventId}-${args.roundId}`);
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not Authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not Authorized");
      }
      const isJudgeOfRound = await ctx.prisma.round.findMany({
        where: {
          eventId: args.eventId,
          Judges: {
            some: {
              userId: user.id,
            },
          },
        },
      });
      if (isJudgeOfRound.length === 0) {
        throw new Error("Not Authorized");
      }
      const teams = await ctx.prisma.team.findMany({
        where: {
          eventId: args.eventId,
          roundNo: {
            gte: args.roundId,
          },
        },
        ...query,
      });
      return teams;
    },
  })
);
