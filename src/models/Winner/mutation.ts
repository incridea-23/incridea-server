import { builder } from "../../builder";
import { WinnerType } from "@prisma/client";

const WinnerTypeEnum = builder.enumType(WinnerType, {
  name: "WinnerType",
});

builder.mutationField("createWinner", (t) =>
  t.prismaField({
    type: "Winners",
    args: {
      teamId: t.arg({ type: "ID", required: true }),
      eventId: t.arg({ type: "ID", required: true }),
      type: t.arg({ type: WinnerTypeEnum, required: true }),
    },
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
      const isJudgeOfLastRound = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
        select: {
          Rounds: {
            select: {
              Judges: true,
            },
          },
        },
      });
      if (!isJudgeOfLastRound) {
        throw new Error("Not authorized");
      }

      const total_rounds = isJudgeOfLastRound.Rounds.length;
      const isJudge = isJudgeOfLastRound.Rounds[total_rounds - 1].Judges.some(
        (judge) => judge.userId === user.id
      );
      if (!isJudge) {
        throw new Error("Not authorized");
      }

      const team = await ctx.prisma.team.findUnique({
        where: {
          id: Number(args.teamId),
        },
      });
      if (!team) {
        throw new Error("Team not found");
      }
      if (team.eventId !== Number(args.eventId)) {
        throw new Error("Team not found");
      }
      if (team.roundNo !== total_rounds) {
        throw new Error("Team not promoted to last round");
      }

      const winner = await ctx.prisma.winners.findFirst({
        where: {
          type: args.type as WinnerType,
          eventId: Number(args.eventId),
          teamId: Number(args.teamId),
        },
      });
      if (winner) {
        throw new Error("Winner already exists");
      }
      const data = await ctx.prisma.winners.create({
        data: {
          teamId: Number(args.teamId),
          eventId: Number(args.eventId),
          type: args.type,
        },
        ...query,
      });
      return data;
    },
  })
);

// delete winner
builder.mutationField("deleteWinner", (t) =>
  t.prismaField({
    type: "Winners",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
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
      const winner = await ctx.prisma.winners.findUnique({
        where: {
          id: Number(args.id),
        },
      });
      if (!winner) {
        throw new Error("Winner not found");
      }
      const isJudgeOfLastRound = await ctx.prisma.event.findUnique({
        where: {
          id: winner.eventId,
        },
        select: {
          Rounds: {
            select: {
              Judges: true,
            },
          },
        },
      });
      if (!isJudgeOfLastRound) {
        throw new Error("Not authorized");
      }

      const total_rounds = isJudgeOfLastRound.Rounds.length;
      const isJudge = isJudgeOfLastRound.Rounds[total_rounds - 1].Judges.some(
        (judge) => judge.userId === user.id
      );
      if (!isJudge) {
        throw new Error("Not authorized");
      }

      const data = await ctx.prisma.winners.delete({
        where: {
          id: Number(args.id),
        },
        ...query,
      });
      return data;
    },
  })
);
