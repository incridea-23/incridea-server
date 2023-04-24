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

//get score as a excel sheet for a particular event and round no with criteria per judge
/* 
output: 
{
  teamName: "team1",
  teamId: 1,
  teamScore: 100,
  judges: [
    {
      judgeName: "judge1",
      judgeId: 1,
      criteria: [
        {
          criteriaId: 1,
          score: 10
        },
        {
          criteriaId: 2,
          score: 10
        },
        ...
    }
  ]
}

*/
class CriteriaClass {
  criteriaId: number;
  score: number;
  constructor(criteriaId: number, score: number) {
    this.criteriaId = criteriaId;
    this.score = score;
  }
}

class JudgeClass {
  judgeName: string;
  judgeId: number;
  criteria: CriteriaClass[];
  constructor(judgeName: string, judgeId: number, criteria: CriteriaClass[]) {
    this.judgeName = judgeName;
    this.judgeId = judgeId;
    this.criteria = criteria;
  }
}

class ScoreSheetClass {
  teamName: string;
  teamId: number;
  teamScore: number;
  judges: JudgeClass[];
  constructor(
    teamName: string,
    teamId: number,
    teamScore: number,
    judges: JudgeClass[]
  ) {
    this.teamName = teamName;
    this.teamId = teamId;
    this.teamScore = teamScore;
    this.judges = judges;
  }
}

const Criteria = builder.objectType(CriteriaClass, {
  name: "CriteriaJuryView",
  fields: (t) => ({
    criteriaId: t.exposeInt("criteriaId"),
    score: t.exposeFloat("score"),
  }),
});

const Judge = builder.objectType(JudgeClass, {
  name: "JudgeJuryView",
  fields: (t) => ({
    judgeName: t.exposeString("judgeName"),
    judgeId: t.exposeInt("judgeId"),
    criteria: t.expose("criteria", {
      type: [Criteria],
    }),
  }),
});

const ScoreSheet = builder.objectType(ScoreSheetClass, {
  name: "ScoreSheetJuryView",
  fields: (t) => ({
    teamName: t.exposeString("teamName"),
    teamId: t.exposeInt("teamId"),
    teamScore: t.exposeFloat("teamScore"),
    judges: t.expose("judges", {
      type: [Judge],
    }),
  }),
});

builder.queryField("getScoreSheetJuryView", (t) =>
  t.field({
    type: [ScoreSheet],
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
      if (user.role !== "JURY") {
        throw new Error("Not authorized");
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
        include: {
          User: true,
        },
      });
      const criteria = await ctx.prisma.criteria.findMany({
        where: {
          eventId: Number(args.eventId),
        },
      });
      const scoreSheet = teams.map(async (team) => {
        const judgesScore = judges.map(async (judge) => {
          const scores = await ctx.prisma.scores.findMany({
            where: {
              teamId: team.id,
              judgeId: judge.userId,
            },
          });
          const criteriaScore = criteria.map((criterion) => {
            const score = scores.find(
              (score) => score.criteriaId === criterion.id
            );
            return {
              criteriaId: criterion.id,
              score: score ? Number(score.score) : 0,
            };
          });
          return {
            judgeName: judge.User.name,
            judgeId: judge.userId,
            criteria: criteriaScore,
          };
        });
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
        return {
          teamName: team.name,
          teamId: team.id,
          teamScore: totalScore,
          judges: await Promise.all(judgesScore),
        };
      });
      return Promise.all(scoreSheet);
    },
  })
);
