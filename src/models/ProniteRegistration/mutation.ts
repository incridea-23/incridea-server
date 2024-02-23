import { builder } from "../../builder";

builder.mutationField("registerPronite", (t) =>
  t.prismaField({
    type: "ProniteRegistration",
    args: {
      userId: t.arg.id(),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, parent, args, ctx) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: Number(args.userId),
        },
      });
      if (!user) {
        throw new Error("No such user exists");
      }
      if (user.id == 466) {
        throw new Error("Does not deserve to register for pronite");
      }

      const authUser = await ctx.user;

      if (!authUser) throw new Error("Not authenticated");
      if (authUser.id != 5181)
        throw new Error("permission denied, wrong account");
      if (!["PARTICIPANT", "ORGANIZER", "BRANCH_REP"].includes(user.role)) {
        throw new Error("User did not register for the fest");
      }
      const pronite = await ctx.prisma.proniteRegistration.findUnique({
        where: {
          userId_proniteDay: {
            userId: Number(args.userId),
            proniteDay: "Day1",
          },
        },
      });
      if (pronite) {
        throw new Error(
          `User already registered for pronite at ${new Date(
            pronite.createdAt
          ).toLocaleTimeString()}`
        );
      }
      const createdPronite = await ctx.prisma.proniteRegistration.create({
        data: {
          userId: Number(args.userId),
          proniteDay: "Day1",
        },
        ...query,
      });
      return createdPronite;
    },
  })
);
