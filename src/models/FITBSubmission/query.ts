import { builder } from "../../builder";

builder.queryField("getFITBSubmissionByTeamId", (t) =>
  t.prismaField({
    type: "FITBSubmission",
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
          TeamMembers: {
            some: {
              userId: user.id,
            },
          },
        },
      });

      if (team?.id !== Number(args.teamId)) {
        throw new Error("Not authorized");
      }

      // if (!team) {
      //   throw new Error("No permission");
      // }

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
      const fitbSubmission = await ctx.prisma.fITBSubmission.findFirst({
        where: {
          teamId: Number(args.teamId),
          Options: {
            questionId: args.questionId,
          },
        },
      });

      if (!fitbSubmission) {
        throw new Error("No submissions by user");
      }

      return fitbSubmission;
    },
  })
);
