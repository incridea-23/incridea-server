import { builder } from "../../builder";

builder.mutationField("addOrganizer", (t) =>
  t.prismaField({
    type: "Organizer",
    args: {
      eventId: t.arg({
        type: "ID",
        required: true,
      }),
      userId: t.arg({
        type: "ID",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) throw new Error("Not authenticated");
      if (user.role !== "BRANCH_REP") throw new Error("No Permission");
      const branch = await ctx.prisma.branchRep.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (!branch) throw new Error(`No Branch Under ${user.name}`);
      const event = await ctx.prisma.event.findUnique({
        where: {
          id: args.eventId as number,
        },
      });
      if (!event) throw new Error(`No Event with id ${args.eventId}`);
      if (event.branchId !== branch.branchId) throw new Error(`No Permission`);
      return ctx.prisma.organizer.create({
        data: {
          Event: {
            connect: {
              id: args.eventId as number,
            },
          },
          User: {
            connect: {
              id: args.userId as number,
            },
          },
        },
      });
    },
  })
);
