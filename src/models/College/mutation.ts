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
    resolve: (query, root, args, ctx, info) => {
      return ctx.prisma.college.create({
        data: {
          name: args.name,
          details: args.details,
        },
      });
    },
  })
);
