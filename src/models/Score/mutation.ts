import { builder } from "../../builder";

builder.mutationField("addScore", (t) =>
  t.prismaField({
    type: "Scores",
    args: {
      teamId: t.arg.int({ required: true }),
      criteriaId: t.arg.int({ required: true }),
      score: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not Authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not Authorized");
      }
      const isJudgeOfRound = await ctx.prisma.criteria.findMany({
        where: {
          id: args.criteriaId,
          Round: {
            Judges: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      });
      if (isJudgeOfRound.length === 0) {
        throw new Error("Not Authorized");
      }
      // create or update
      const score = await ctx.prisma.scores.upsert({
        where: {
          teamId_criteriaId: {
            teamId: args.teamId,
            criteriaId: args.criteriaId,
          },
        },
        update: {
          score: args.score,
        },
        create: {
          teamId: args.teamId,
          criteriaId: args.criteriaId,
          score: args.score,
        },
        ...query,
      });
      return score;
    },
  })
);
