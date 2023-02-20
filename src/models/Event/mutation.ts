import { builder } from "../../builder";

const EventCreateInput = builder.inputType("EventCreateInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    eventDate: t.field({
      type: "Date",
      required: false,
    }),
    venue: t.string({ required: false }),
  }),
});

builder.mutationField("createEvent", (t) =>
  t.prismaField({
    type: "Event",
    args: {
      data: t.arg({
        type: EventCreateInput,
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
      return ctx.prisma.event.create({
        data: {
          ...args.data,
          Branch: {
            connect: {
              id: branch.branchId,
            },
          },
        },
      });
    },
  })
);
