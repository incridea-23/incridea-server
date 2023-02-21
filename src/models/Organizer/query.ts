import { builder } from "../../builder";

builder.queryField("getOrganizers", (t) =>
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
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.organizer.findUniqueOrThrow({
        where: {
            userId_eventId: {
              userId: Number(args.userId),
              eventId: Number(args.eventId),
            },
          },
      });
    },
  })
);