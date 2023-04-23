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
      roundNo: t.arg({ type: "Int", required: true }),
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
      //check if the user is a judge of the event
      const event = await ctx.prisma.judge.findUnique({
        where: {
          userId: Number(user.id),
        },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      if (event.eventId !== Number(args.eventId)) {
        throw new Error("Not judge of this event");
      }
      //get the final round no for the event
      const maxRoundNo = await ctx.prisma.round.findMany({
        where: {
          eventId: Number(args.eventId),
        },
        orderBy: {
          roundNo: "desc",
        },
        take: 1,
      });
      if (maxRoundNo[0].roundNo !== Number(args.roundNo)) {
        throw new Error("Not final Round");
      }
      //check if the team qualified for the final round
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: Number(args.teamId),
        },
      });
      if (!team) {
        throw new Error("Team not in final round");
      }
      //check if winner already exists
      const winner = await ctx.prisma.winners.findMany({
        where: {
          type: args.type as WinnerType,
          eventId: Number(args.eventId),
          teamId: Number(args.teamId),
        },
      });
      if (winner.length > 0) {
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
