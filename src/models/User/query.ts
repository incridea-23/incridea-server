import { builder } from "../../builder";

builder.queryField("users", (t) =>
  t.prismaConnection({
    type: "User",
    cursor: "id",
    args: {
      contains: t.arg({
        type: "String",
        required: false,
      }),
    },
    resolve: (query, root, args, ctx, info) => {
      const filter = args.contains || "";
      console.log("filter:", filter);
      return ctx.prisma.user.findMany({
        where: {
          role: {
            notIn: ["ADMIN", "JUDGE", "USER", "JURY"],
          },
          OR: [
            {
              email: {
                contains: filter,
              },
            },
            {
              name: {
                contains: filter,
              },
            },
            filter !== "" && !isNaN(Number(filter))
              ? {
                  id: Number(filter),
                }
              : {},
          ],
        },
        ...query,
      });
    },
  })
);

builder.queryField("me", (t) =>
  t.prismaField({
    type: "User",
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      return user;
    },
  })
);

builder.queryField("userById", (t) =>
  t.prismaField({
    type: "User",
    args: {
      id: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: Number(args.id),
        },
      });
    },
  })
);
