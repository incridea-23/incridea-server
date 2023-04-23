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
      const event = await ctx.prisma.event.findFirst({
        where: {
          id: Number(args.eventId),
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
        select: {
          Rounds: {
            select: {
              completed: true,
              roundNo: true,
              Judges: true,
            },
          },
        },
      });
      if (!event) {
        throw new Error("Not authorized");
      }

      const total_rounds = event.Rounds.length;
      if (event.Rounds[total_rounds - 1].completed) {
        throw new Error("Cant Change Round Completed");
      }
      // check if he is the judge of last round
      if (
        !event.Rounds[total_rounds - 1].Judges.some(
          (judge) => judge.userId === user.id
        )
      ) {
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
      const event = await ctx.prisma.event.findFirst({
        where: {
          id: winner.eventId,
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
        select: {
          Rounds: {
            select: {
              Judges: true,
              completed: true,
            },
          },
        },
      });
      if (!event) {
        throw new Error("Not authorized");
      }
      const total_rounds = event.Rounds.length;
      if (event.Rounds[total_rounds - 1].completed) {
        throw new Error("Cant Change Round Completed");
      }
      if (
        !event.Rounds[total_rounds - 1].Judges.some(
          (judge) => judge.userId === user.id
        )
      ) {
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
