import { builder } from "../../builder";

builder.mutationField("createTeam", (t) =>
  t.prismaField({
    type: "Team",
    args: {
      name: t.arg.string({ required: true }),
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
      if (user.role in ["USER", "JUDGE", "JURY"]) {
        throw new Error("Not authorized");
      }
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: Number(args.eventId),
        },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      // TODO: check if event started and if yes, throw error
      if (
        event.eventType === "INDIVIDUAL" ||
        event.eventType === "INDIVIDUAL_MULTIPLE_ENTRY"
      ) {
        throw new Error("Event is individual");
      }
      const isPaidEvent = event.fees > 0;
      if (event.eventType === "TEAM") {
        const registeredTeam = await ctx.prisma.team.findMany({
          where: {
            eventId: Number(args.eventId),
            TeamMembers: {
              some: {
                userId: user.id,
              },
            },
          },
        });
        if (registeredTeam.length > 0) {
          throw new Error("Already registered");
        }
      }
      const totalTeams = await ctx.prisma.team.count({
        where: {
          eventId: Number(args.eventId),
        },
      });
      if (event.maxTeamSize && totalTeams >= event.maxTeamSize) {
        throw new Error("Event is full");
      }

      return await ctx.prisma.team.create({
        data: {
          name: args.name,
          eventId: Number(args.eventId),
          TeamMembers: {
            create: {
              userId: user.id,
            },
          },
          confirmed: !isPaidEvent,
        },
      });
    },
  })
);

builder.mutationField("joinTeam", (t) =>
  t.prismaField({
    type: "TeamMember",
    args: {
      teamId: t.arg.id({ required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      const team = await ctx.prisma.team.findUnique({
        where: {
          id: Number(args.teamId),
        },
      });
      if (!team) {
        throw new Error("Team not found");
      }
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: team.eventId,
        },
      });
      if (!event) {
        throw new Error("Event not found");
      }
      if (event.eventType === "INDIVIDUAL") {
        throw new Error("Event is individual");
      }
      const isPaidEvent = event.fees > 0;
      if (event.eventType === "TEAM") {
        const registeredTeam = await ctx.prisma.team.findMany({
          where: {
            eventId: Number(event.id),
            TeamMembers: {
              some: {
                userId: user.id,
              },
            },
          },
        });
        if (registeredTeam.length > 0) {
          throw new Error("Already registered");
        }
      }
      const teamMembers = await ctx.prisma.teamMember.findMany({
        where: {
          teamId: Number(args.teamId),
        },
      });
      if (teamMembers.length >= event.maxTeamSize) {
        throw new Error("Team is full");
      }
      return await ctx.prisma.teamMember.create({
        data: {
          teamId: Number(args.teamId),
          userId: user.id,
        },
      });
    },
  })
);
