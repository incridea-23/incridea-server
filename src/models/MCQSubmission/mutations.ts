import { builder } from "../../builder";
import { secrets } from "../../utils/auth/jwt";

builder.mutationField("createMCQSubmission", (t) =>
  t.prismaField({
    type: ["MCQSubmission"],
    args: {
      teamId: t.arg({
        type: "String",
        required: true,
      }),
      questionId: t.arg({
        type: "String",
        required: true,
      }),
      optionId: t.arg({
        type: ["String"],
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

      if (!team) {
        console.log("Team not found");
        throw new Error("No permission");
      }

      // Delete all previous submissions and create new ones if MMCQ
      await ctx.prisma.mCQSubmission.deleteMany({
        where: {
          teamId: Number(args.teamId),
          Options: {
            questionId: args.questionId,
          },
        },
      });
      return await Promise.all(
        args.optionId.map(async (option) => {
          const mcqSubmissionExists = await ctx.prisma.mCQSubmission.findFirst({
            where: {
              teamId: Number(args.teamId),
              optionId: option,
            },
            include: {
              Options: true,
            },
          });

          if (mcqSubmissionExists) {
            // If previous and current submission are same
            if (mcqSubmissionExists.optionId === option) {
              return mcqSubmissionExists;
            }

            // If previous and current submission are different
            const newSubmission = await ctx.prisma.mCQSubmission.update({
              where: {
                id: mcqSubmissionExists.id,
              },
              data: {
                Options: {
                  connect: {
                    id: option,
                  },
                },
              },
              include: {
                Options: {
                  include: {
                    Question: true,
                  },
                },
              },
            });

            // If the previous submission was incorrect and the new submission is correct
            if (
              !mcqSubmissionExists.Options.isAnswer &&
              newSubmission.Options.isAnswer
            ) {
              const currentScore = await ctx.prisma.scores.findUnique({
                where: {
                  teamId_criteriaId_judgeId: {
                    teamId: Number(args.teamId),
                    criteriaId: Number(secrets.QUIZ_CRITERIA_ID),
                    judgeId: Number(secrets.QUIZ_JUDGE_ID),
                  },
                },
              });

              const newScore =
                Number(currentScore?.score) +
                newSubmission.Options.Question.points;

              await ctx.prisma.scores.update({
                where: {
                  teamId_criteriaId_judgeId: {
                    teamId: Number(args.teamId),
                    criteriaId: Number(secrets.QUIZ_CRITERIA_ID),
                    judgeId: Number(secrets.QUIZ_JUDGE_ID),
                  },
                },
                data: {
                  score: newScore.toString(),
                },
              });
              return newSubmission;
            }

            // If the previous submission was correct and the new submission is incorrect
            else if (
              mcqSubmissionExists.Options.isAnswer &&
              !newSubmission.Options.isAnswer
            ) {
              const currentScore = await ctx.prisma.scores.findUnique({
                where: {
                  teamId_criteriaId_judgeId: {
                    teamId: Number(args.teamId),
                    criteriaId: Number(secrets.QUIZ_CRITERIA_ID),
                    judgeId: Number(secrets.QUIZ_JUDGE_ID),
                  },
                },
              });

              const newScore =
                Number(currentScore?.score) -
                newSubmission.Options.Question.points +
                newSubmission.Options.Question.negativePoints;

              await ctx.prisma.scores.update({
                where: {
                  teamId_criteriaId_judgeId: {
                    teamId: Number(args.teamId),
                    criteriaId: Number(secrets.QUIZ_CRITERIA_ID),
                    judgeId: Number(secrets.QUIZ_JUDGE_ID),
                  },
                },
                data: {
                  score: newScore.toString(),
                },
              });
              return newSubmission;
            }
          }

          return await ctx.prisma.mCQSubmission.create({
            data: {
              Options: {
                connect: {
                  id: option,
                },
              },
              Team: {
                connect: {
                  id: Number(args.teamId),
                },
              },
            },
          });
        })
      );
    },
  })
);
