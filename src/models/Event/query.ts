import { builder } from "../../builder";

// with pagination and filtering
builder.queryField("events", (t) =>
  t.prismaField({
    type: ["Event"],
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.event.findMany({
        ...query,
      });
    },
  })
);
