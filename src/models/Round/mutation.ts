import { builder } from "../../builder";

builder.mutationField("createRound", (t) =>
  t.prismaField({
    type: "Round",
    args: {
      eventId: t.arg.id({ required: true }),
      date: t.arg({ type: "Date", required: false }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "ORGANIZER") {
        throw new Error("Not authorized");
      }
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
        include: {
          Organizers: true,
          Rounds: true,
        },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      if (!event.Organizers.find((o) => o.userId === user.id)) {
        throw new Error("Not authorized");
      }
      const roundNumber = event.Rounds.length + 1;
      return ctx.prisma.round.create({
        data: {
          roundNo: roundNumber,
          date: args.date,
          Event: {
            connect: {
              id: Number(args.eventId),
            },
          },
        },
      });
    },
  })
);

// deleteRound
builder.mutationField("deleteRound", (t) =>
  t.prismaField({
    type: "Round",
    args: {
      eventId: t.arg.id({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "ORGANIZER") {
        throw new Error("Not authorized");
      }
      const lastRound = await ctx.prisma.round.findFirst({
        where: {
          eventId: Number(args.eventId),
        },
        orderBy: {
          roundNo: "desc",
        },
      });
      if (!lastRound) {
        throw new Error("No rounds found");
      }
      const round = await ctx.prisma.round.findUnique({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: lastRound.roundNo,
          },
        },
        include: {
          Event: {
            include: {
              Organizers: true,
            },
          },
        },
      });
      if (!round) {
        throw new Error("Round not found");
      }
      if (!round.Event.Organizers.find((o) => o.userId === user.id)) {
        throw new Error("Not authorized");
      }
      return ctx.prisma.round.delete({
        where: {
          eventId_roundNo: {
            eventId: Number(args.eventId),
            roundNo: lastRound.roundNo,
          },
        },
      });
    },
  })
);
