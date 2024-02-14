import { builder } from "../../builder";

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
          });

          if (mcqSubmissionExists) {
            const removed = mcqSubmissionExists;
            return await ctx.prisma.mCQSubmission.update({
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
            });
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
