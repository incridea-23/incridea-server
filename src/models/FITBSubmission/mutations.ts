import { builder } from "../../builder";

builder.mutationField("createFTIBSubmission", (t) =>
  t.prismaField({
    type: "FITBSubmission",
    args: {
      teamId: t.arg({
        type: "String",
        required: true,
      }),
      questionId: t.arg({
        type: "String",
        required: true,
      }),
      value: t.arg({
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
      const options = await ctx.prisma.options.findFirst({
        where: {
          questionId: args.questionId,
        },
      });
      if (!options) {
        throw new Error("option does not exist");
      }

      const fitbSubmissionExists = await ctx.prisma.fITBSubmission.findFirst({
        where: {
          teamId: Number(args.teamId),
          optionId: options.id,
        },
      });

      if (fitbSubmissionExists) {
        return await ctx.prisma.fITBSubmission.update({
          where: {
            id: fitbSubmissionExists.id,
          },
          data: {
            value: args.value,
          },
        });
      }

      return await ctx.prisma.fITBSubmission.create({
        data: {
          Options: {
            connect: {
              id: options.id,
            },
          },
          Team: {
            connect: {
              id: Number(args.teamId),
            },
          },
          value: args.value,
        },
      });
    },
  })
);
