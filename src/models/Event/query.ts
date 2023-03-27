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
      });
    },
  }),
);
