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
