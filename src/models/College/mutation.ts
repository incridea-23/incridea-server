import { resolve } from "path";
import { builder } from "../../builder";

builder.mutationField("createCollege", (t) =>
  t.prismaField({
    type: "College",
    args: {
      name: t.arg({
        type: "String",
        required: true,
      }),
      details: t.arg({
        type: "String",
        required: false,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (user?.role != "ADMIN") throw new Error("No Permission");
      return ctx.prisma.college.create({
        data: {
          name: args.name,
          details: args.details,
        },
      });
    },
  })
);
