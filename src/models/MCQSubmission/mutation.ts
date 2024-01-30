import { builder } from "../../builder";

builder.mutationField("acceptSubmission", (t) =>
  t.prismaField({
    type: "MCQSubmission",
    args: {
        teamId: t.arg({ type: "Int", required: true }),
        optionId: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }


      const now = new Date();
      const acceptedSubmission = await ctx.prisma.mCQSubmission.create({
        data: {
          teamId: args.teamId,
          optionId: args.optionId,
          createdAt: now,
        },
        ...query,
      });

      return acceptedSubmission;
    },
  })
);
