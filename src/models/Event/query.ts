import { builder } from "../../builder";

// with pagination and filtering
builder.queryField("events", (t) =>
  t.prismaConnection({
    type: "Event",
    cursor: "id",
    args: {
      contains: t.arg({
        type: "String",
        required: false,
      }),
    },

    resolve: (query, root, args, ctx, info) => {
      const filter = args.contains || "";
      return ctx.prisma.event.findMany({
        where: {
          OR: [
            {
              name: {
                contains: filter,
              },
            },
            {
              description: {
                contains: filter,
              },
            },
          ],
        },
        ...query,
      });
    },
  })
);

//Events By ID
builder.queryField("eventById", (t) =>
  t.prismaField({
    type: "Event",
    args: {
      id: t.arg({
        type: "ID",
        required: true,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.event.findUniqueOrThrow({
        where: {
          id: Number(args.id),
        },
        ...query,
      });
    },
  })
);

builder.queryField("registeredEvents", (t) =>
  t.prismaField({
    type: ["Event"],
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      return ctx.prisma.event.findMany({
        where: {
          Teams: {
            some: {
              TeamMembers: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
        ...query,
        include: {
          Teams: {
            where: {
              TeamMembers: {
                some: {
                  userId: user.id,
                },
              },
            },
          },
        },
      });
    },
  })
);

builder.queryField("publishedEvents", (t) =>
  t.prismaField({
    type: ["Event"],
    resolve: async (query, root, args, ctx, info) => {
      const core_event = await ctx.prisma.event.findMany({
        where: {
          AND: [
            {
              published: true,
            },
            {
              category: "CORE",
            },
          ],
        },
        orderBy: {
          name: "asc",
        },
        ...query,
      });
      const non_core_event = await ctx.prisma.event.findMany({
        where: {
          AND: [
            {
              published: true,
            },
            {
              NOT: {
                category: "CORE",
              },
            },
          ],
        },
        orderBy: {
          name: "asc",
        },
        ...query,
      });
      return [...core_event, ...non_core_event];
    },
  })
);
