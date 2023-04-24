import { builder } from "../../builder";

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
      if (!["JUDGE", "JURY"].includes(user.role)) {
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
      if (!["JUDGE", "JURY"].includes(user.role)) {
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

//get score as a excel sheet for a particular event and round no
// builder.queryField("getScoreSheet", (t) =>
//     t.prismaField({
//       type: ["Team"],
//       args: {
//         eventId: t.arg({ type: "ID", required: true }),
//         roundNo: t.arg({ type: "Int", required: true }),
//       },
//       errors: {
//         types: [Error],
//       },
//       resolve: async (query, root, args, ctx, info) => {
//         const user = await ctx.user;
//         if (!user) {
//           throw new Error("Not authenticated");
//         }
//         if(user.role === "ADMIN"
//         || user.role === "ORGANIZER"
//         || user.role === "BRANCH_REP"
//         || user.role === "PARTICIPANT"
//         || user.role === "USER")
//         {
//           throw new Error("Not authorized");
//         }
//         //get data such that for each judge we see the score of each team with criteria
//         const data = await ctx.prisma.team.findMany({
//           where: {
//             roundEventId: Number(args.eventId),
//             roundRoundNo: Number(args.roundNo),
//           },
//           include: {
//             Score: true,
//           },
//         });
//         //get in the form team name,judge name, criteria id, score
//         const scoreSheet = [];
//         for (let i = 0; i < data.length; i++) {
//           const team = data[i];
//           const teamName = team.name;
//           const teamId = team.id;
//           const teamScore = team.Scores;
//           for (let j = 0; j < teamScore.length; j++) {
//             const scoreData = teamScore[j];
//             const judgeId = scoreData.judgeId;
//             const criteriaId = scoreData.criteriaId;
//             const score = scoreData.score;
//             const judge = await ctx.prisma.user.findUnique({
//               where: {
//                 id: judgeId,
//               },
//             });
//             const judgeName = judge?.name;
//             const scoreSheetData = {
//               teamName,
//               teamId,
//               judgeName,
//               judgeId,
//               criteriaId,
//               score,
//             };
//             scoreSheet.push(scoreSheetData);
//           }
//         }
//         console.log(scoreSheet);
//         return data;
//     }
//   })
// );

class TotalScoreClass {
  totalScore: number;
  judgeScore: number;
  teamId: number;
  constructor(totalScore: number, judgeScore: number, teamId: number) {
    this.totalScore = totalScore;
    this.judgeScore = judgeScore;
    this.teamId = teamId;
  }
}

const TotalScore = builder.objectType(TotalScoreClass, {
  name: "TotalScores",
  fields: (t) => ({
    totalScore: t.exposeFloat("totalScore"),
    judgeScore: t.exposeFloat("judgeScore"),
    teamId: t.exposeInt("teamId"),
  }),
});

builder.queryField("getTotalScores", (t) =>
  t.field({
    type: [TotalScore],
    args: {
      eventId: t.arg({ type: "ID", required: true }),
      roundNo: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      if (!["JUDGE", "JURY"].includes(user.role)) {
        throw new Error("Not authorized");
      }
      if (user.role == "JUDGE") {
        // check if the judge is assigned to the event
        const judge = await ctx.prisma.judge.findUnique({
          where: {
            userId_eventId_roundNo: {
              userId: user.id,
              eventId: Number(args.eventId),
              roundNo: Number(args.roundNo),
            },
          },
        });
        if (!judge) {
          throw new Error("Not authorized");
        }
      }
      const teams = await ctx.prisma.team.findMany({
        where: {
          roundNo: Number(args.roundNo),
          eventId: Number(args.eventId),
        },
      });
      const judges = await ctx.prisma.judge.findMany({
        where: {
          eventId: Number(args.eventId),
          roundNo: Number(args.roundNo),
        },
      });
      const criteria = await ctx.prisma.criteria.findMany({
        where: {
          eventId: Number(args.eventId),
          roundNo: Number(args.roundNo),
        },
      });

      const total_scores = teams.map(async (team) => {
        const scores = await ctx.prisma.scores.findMany({
          where: {
            teamId: team.id,
            judgeId: {
              in: judges.map((judge) => judge.userId),
            },
          },
        });

        const totalScore = scores.reduce(
          (acc, score) => acc + (score.score ? Number(score.score) : 0),
          0
        );
        const judgeScore = scores.reduce((acc, score) => {
          if (score.judgeId === user.id) {
            return acc + (score.score ? Number(score.score) : 0);
          }
          return acc;
        }, 0);
        console.log(totalScore, judgeScore, team.id);
        return {
          totalScore,
          judgeScore,
          teamId: team.id,
        };
      });
      return Promise.all(total_scores);
    },
  })
);
