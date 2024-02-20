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
    nullable: true,
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;

      // Check permissions
      const userInTeam = await ctx.prisma.user.findUnique({
        where: {
          id: user?.id,
        },
        include: {
          TeamMembers: {
            where: {
              teamId: Number(args.teamId),
            },
          },
        },
      });

      if (!userInTeam) {
        throw new Error("User not in team");
      }

      // Get already existing data
      const allSubmissionsForQuestion = await ctx.prisma.mCQSubmission.findMany(
        {
          where: {
            teamId: Number(args.teamId),
            Options: {
              questionId: args.questionId,
            },
          },
        },
      );

      let currentScore = await ctx.prisma.scores.findFirst({
        where: {
          Judge: {
            Round: {
              Quiz: {
                Questions: {
                  some: {
                    id: args.questionId,
                  },
                },
              },
            },
          },
          Criteria: {
            name: {
              startsWith: "QuizScore",
            },
          },
        },
      });

      // Create a current score if not already existing
      if (currentScore === null) {
        const criteria = await ctx.prisma.criteria.findFirst({
          where: {
            Round: {
              Quiz: {
                Questions: {
                  some: {
                    id: args.questionId,
                  },
                },
              },
            },
            name: {
              startsWith: "QuizScore",
            },
          },
          include: {
            Round: {
              include: {
                Quiz: true,
              },
            },
          },
        });

        const judge = await ctx.prisma.user.findFirst({
          where: {
            email: "quiz_" + criteria?.Round.Quiz?.id + "@incridea.in",
          },
        });
        if (criteria && judge)
          currentScore = await ctx.prisma.scores.create({
            data: {
              Criteria: {
                connect: {
                  id: criteria.id,
                },
              },
              Judge: {
                connect: {
                  userId_eventId_roundNo: {
                    userId: judge.id,
                    eventId: criteria.eventId,
                    roundNo: criteria.roundNo,
                  },
                },
              },
              Team: {
                connect: {
                  id: Number(args.teamId),
                },
              },
              score: "0",
            },
          });
      }

      if (allSubmissionsForQuestion.length > 0) {
		  console.log("runnign")
        const toDelete = allSubmissionsForQuestion.map((submission) => {
          if (
            args.optionId.findIndex(
              (option) => option === submission.optionId,
            ) === -1
          ) {
            return submission.optionId;
          }
        });

        const toCreate = args.optionId.map((option) => {
          if (
            allSubmissionsForQuestion.findIndex(
              (submission) => option === submission.optionId,
            ) === -1
          ) {
            return option;
          }
        });

        let newScore = currentScore?.score;
        // Create or update submissions
        await Promise.all(
          toCreate.map(async (optionId) => {
            const optionDetails = await ctx.prisma.options.findUnique({
              where: {
                id: optionId,
              },
              include: {
                Question: true,
              },
            });

            if (optionDetails) {
              if (optionDetails?.isAnswer) {
                newScore = (
                  Number(newScore) + optionDetails.Question.points
                ).toString();
              } else {
                newScore = (
                  Number(newScore) -
                  optionDetails?.Question?.negativePoints
                ).toString();
              }
            }
          }),
        );
        await Promise.all(
          toDelete.map(async (optionId) => {
            const optionDetails = await ctx.prisma.options.findUnique({
              where: {
                id: optionId,
              },
              include: {
                Question: true,
              },
            });

            if (optionDetails) {
              if (optionDetails?.isAnswer) {
                newScore = (
                  Number(newScore) -
                  optionDetails.Question.points 
                ).toString();
              } else {
                newScore = (
                  Number(newScore) +
                  optionDetails?.Question?.negativePoints
                ).toString();
              }
            }
          }),
        );
        await ctx.prisma.scores.update({
          where: {
            teamId_criteriaId_judgeId: {
              teamId: Number(args.teamId),
              criteriaId: Number(currentScore?.criteriaId),
              judgeId: Number(currentScore?.judgeId),
            },
          },
          data: {
            score: newScore,
          },
        });
        await ctx.prisma.mCQSubmission.deleteMany({
          where: {
            Options: {
              Question: {
                options: {
                  some: {
                    id: args.optionId[0],
                  },
                },
              },
            },
          },
        });
        return await Promise.all(
          args.optionId.map(async (option) => {
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
          }),
        );
      } else {
        let newScore = currentScore?.score
        const result = await Promise.all(
          args.optionId.map(async (option) => {
            const optionDetails = await ctx.prisma.options.findUnique({
              where: {
                id: option,
              },
              include: {
                Question: true,
              },
            });

            if (optionDetails) {
              if (optionDetails?.isAnswer) {
                newScore = (
                  Number(newScore) + optionDetails.Question.points
                ).toString();
              } else {
                newScore = (
                  Number(newScore) -
                  optionDetails?.Question?.negativePoints
                ).toString();
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
          }),
        );
        await ctx.prisma.scores.update({
          where: {
            teamId_criteriaId_judgeId: {
              teamId: Number(args.teamId),
              criteriaId: Number(currentScore?.criteriaId),
              judgeId: Number(currentScore?.judgeId),
            },
          },
          data: {
            score: newScore,
          },
        });
        return result;
      }
    },
  }),
);
