import { builder } from "../../builder";

builder.mutationField("addBranchRep", (t) =>
  t.prismaField({
    type: "BranchRep",
    args: {
      branchId: t.arg({
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
      if (!user) throw new Error("Not Authenticated");
      if (user.role !== "ADMIN") throw new Error("No Permission");
      const branch = await ctx.prisma.branch.findUnique({
        where: {
          id: Number(args.branchId),
        },
      });
      if (!branch) throw new Error(`No Branch with id ${args.branchId}`);
      return ctx.prisma.branchRep.create({
        data: {
          Branch: {
            connect: {
              id: Number(args.branchId),
            },
          },
          User: {
            connect: {
              id: Number(args.userId),
            },
          },
        },
      });
    },
  })
);