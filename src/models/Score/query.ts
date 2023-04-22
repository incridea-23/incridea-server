import { builder } from "../../builder";
import { Scores, Comments } from "@prisma/client";

builder.queryField("getScore", (t) =>
  t.prismaField({
    type: "Scores",
    args: {
      criteriaId: t.arg({ type: "ID", required: true }),
      teamId: t.arg({ type: "ID", required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not authorized");
      }
      const data = await ctx.prisma.scores.findUniqueOrThrow({
        where: {
          teamId_criteriaId_judgeId: {
            teamId: Number(args.teamId),
            criteriaId: Number(args.criteriaId),
            judgeId: user.id,
          },
        },
        ...query,
      });
      return data;
    },
  })
);

builder.queryField("getComment", (t) =>
  t.prismaField({
    type: "Comments",
    args: {
      roundNo: t.arg({ type: "Int", required: true }),
      eventId: t.arg({ type: "ID", required: true }),
      teamId: t.arg({ type: "ID", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (user.role !== "JUDGE") {
        throw new Error("Not authorized");
      }
      const data = await ctx.prisma.comments.findUniqueOrThrow({
        where: {
          teamId_eventId_roundNo_judgeId: {
            teamId: Number(args.teamId),
            eventId: Number(args.eventId),
            roundNo: Number(args.roundNo),
            judgeId: user.id,
          },
        },
        ...query,
      });
      return data;
    },
  })
);
