import { builder } from "../../builder";

builder.queryField("getMCQSubmissionByTeamId", (t) =>
  t.prismaField({
    type: ["MCQSubmission"],
    args: {
      questionId: t.arg({
        type: "String",
        required: true,
      }),
      teamId: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (user?.role !== "PARTICIPANT") {
        throw new Error("No permission");
      }

      const team = await ctx.prisma.team.findFirst({
        where: {
          id: Number(args.teamId),
          Event: {
            Rounds: {
              some: {
                Quiz: {
                  Questions: {
                    some: {
                      id: args.questionId,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // if (!team) {
      //   console.log("Team not found");
      //   throw new Error("No permission");
      // }

      const mcqSubmission = await ctx.prisma.mCQSubmission.findMany({
        where: {
          teamId: Number(args.teamId),
          Options: {
            questionId: args.questionId,
          },
        },
      });
      console.log("test", mcqSubmission);

      if (mcqSubmission.length === 0) {
        throw new Error("No submissions by user");
      }

      return mcqSubmission;
    },
  })
);
