import { builder } from "../../builder";

class Option {
  id: string;
  answer: string;

  constructor(id: string, answer: string) {
    this.id = id;
    this.answer = answer;
  }
}

class AllSubmissions {
  userId: string;
  qtype: string;
  question: string;
  qid: string;
  options?: Option;
  mcqans: string | null;
  isright: boolean | null;
  fitbans: string | null;
  laAns: string | null;
  laIsRight: string | null;

  constructor(
    id: string,
    answer: string,
    mcqans: string | null,
    isright: boolean | null,
    fitbans: string | null,
    laAns: string | null,
    laIsRight: string | null,
    userId: string,
    qtype: string,
    question: string,
    qid: string
  ) {
    this.options = {
      id,
      answer,
    };
    this.mcqans = mcqans;
    this.isright = isright;
    this.fitbans = fitbans;
    this.laAns = laAns;
    this.laIsRight = laIsRight;
    this.userId = userId;
    this.qtype = qtype;
    this.question = question;
    this.qid = qid;
  }
}
const AllSubmissionsType = builder.objectType(AllSubmissions, {
  name: "AllSubmissions",
  fields: (t) => ({
    option: t.expose("options", { nullable: true, type: Option }),
    mcqans: t.exposeString("mcqans", { nullable: true }),
    isRight: t.exposeBoolean("isright", { nullable: true }),
    fitbans: t.exposeString("fitbans", { nullable: true }),
    laAns: t.exposeString("laAns", { nullable: true }),
    laIsRight: t.exposeString("laIsRight", { nullable: true }),
    userId: t.exposeString("userId"),
    qtype: t.exposeString("qtype"),
    question: t.exposeString("question"),
    qid: t.exposeString("qid"),
  }),
});

builder.queryField("getAllQuizSubmissions", (t) =>
  t.field({
    type: [AllSubmissionsType],
    args: {
      id: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx, info) => {
      try {
        let quizSubmissions: {
          userId: string;
          qtype: string;
          question: string;
          qid: string;
          mcqans: string | null;
          isright: boolean | null;
          fitbans: string | null;
          laAns: string | null;
          laIsRight: string | null;
        }[] = [];
        const mcqsubmissions = await ctx.prisma.mCQSubmission.findMany({
          where: {
            Options: {
              Question: {
                quizId: args.id,
              },
            },
          },
          include: {
            Options: {
              //select: {
              //    value: true,
              //    questionId: true,
              //    isAnswer: true,
              //    Question: {
              //        select: {
              //            points: true,
              //            negativePoints: true,
              //            questionType: true,
              //            question: true
              //        }
              //    }
              //}
              include: {
                Question: true,
              },
            },
          },
        });

        let mcq = mcqsubmissions.map((item) => {
          return {
            userId: item?.teamId?.toString(),
            qtype: item?.Options?.Question?.questionType.toString(),
            question: item?.Options?.Question?.question,
            qid: item?.Options?.questionId,
            mcqans: item?.Options?.value,
            isright: item?.Options?.isAnswer,
            fitbans: null,
            laAns: null,
            laIsRight: null,
          };
        });

        quizSubmissions.push(...mcq);

        const fitbsubmissions = await ctx.prisma.fITBSubmission.findMany({
          where: {
            Options: {
              Question: {
                quizId: args.id,
              },
            },
          },
          include: {
            Options: {
              select: {
                isAnswer: true,
                questionId: true,
                Question: {
                  select: {
                    question: true,
                    questionType: true,
                    negativePoints: true,
                    points: true,
                  },
                },
              },
            },
          },
        });

        let fitb = fitbsubmissions.map((item) => {
          return {
            userId: item?.teamId?.toString(),
            qtype: item?.Options?.Question?.questionType,
            question: item?.Options?.Question?.question,
            qid: item?.Options?.questionId,
            mcqans: null,
            isright: item?.isRight,
            fitbans: item?.value,
            laAns: null,
            laIsRight: null,
          };
        });

        quizSubmissions.push(...fitb);

        const lasubmissions = await ctx.prisma.lASubmission.findMany({
          where: {
            Question: {
              quizId: args.id,
            },
          },
          include: {
            Question: {
              select: {
                negativePoints: true,
                questionType: true,
                question: true,
              },
            },
          },
        });

        let la = lasubmissions.map((item) => {
          return {
            userId: item?.teamId?.toString(),
            qtype: item?.Question?.questionType,
            question: item?.Question?.question,
            qid: item?.questionId,
            mcqans: null,
            isright: null,
            fitbans: null,
            laAns: item?.value,
            laIsRight: item?.isRight?.toString(),
          };
        });

        quizSubmissions.push(...la);

        quizSubmissions.sort((a, b) => Number(a.userId) - Number(b.userId));

        const result = {
          mcq: mcqsubmissions,
          fitb: fitbsubmissions,
          laSubmissions: lasubmissions,
        };
        return quizSubmissions;
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
  })
);

builder.queryField("getQuizByEvent", (t) =>
  t.prismaField({
    type: ["Quiz"],
    args: {
      eventId: t.arg({
        type: "Int",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      try {
        const user = await ctx.user;
        if (!user) {
          throw new Error("Not authenticated");
        }
        if (user.role !== "ORGANIZER") {
          throw new Error("Not authorized");
        }
        const event = await ctx.prisma.event.findUnique({
          where: {
            id: Number(args.eventId),
          },
          include: {
            Organizers: true,
          },
        });
        if (!event) {
          throw new Error("Event not found");
        }
        if (!event.Organizers.find((o) => o.userId === user.id)) {
          throw new Error("Not authorized");
        }

        const data = await ctx.prisma.quiz.findMany({
          where: {
            eventId: Number(args.eventId),
          },
          include: {
            Round: true,
          },
          ...query,
        });
        console.log(data);
        if (!data) {
          throw new Error("There is no quiz in this event");
        }
        return data;
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
  })
);

builder.queryField("getSubmissionByUser", (t) =>
  t.field({
    type: [AllSubmissionsType],
    args: {
      teamId: t.arg({
        type: "String",
        required: true,
      }),
      quizId: t.arg({
        type: "String",
        required: true,
      }),
    },
    resolve: async (root, args, ctx, info) => {
      try {
        let quizSubmissions: {
          userId: string;
          qtype: string;
          question: string;
          qid: string;
          mcqans: string | null;
          isright: boolean | null;
          fitbans: string | null;
          laAns: string | null;
          laIsRight: string | null;
        }[] = [];
        const mcqsubmissions = await ctx.prisma.mCQSubmission.findMany({
          where: {
            teamId: Number(args.teamId),
            Options: {
              Question: {
                quizId: args.quizId,
              },
            },
          },
          include: {
            Options: {
              select: {
                value: true,
                questionId: true,
                isAnswer: true,
                Question: {
                  select: {
                    points: true,
                    negativePoints: true,
                    questionType: true,
                    question: true,
                  },
                },
              },
            },
          },
        });

        let mcq = mcqsubmissions.map((item) => {
          return {
            userId: item?.teamId?.toString(),
            qtype: item?.Options?.Question?.questionType.toString(),
            question: item?.Options?.Question?.question,
            qid: item?.Options?.questionId,
            mcqans: item?.Options?.value,
            isright: item?.Options?.isAnswer,
            fitbans: null,
            laAns: null,
            laIsRight: null,
          };
        });

        quizSubmissions.push(...mcq);

        const fitbsubmissions = await ctx.prisma.fITBSubmission.findMany({
          where: {
            teamId: Number(args.teamId),
            Options: {
              Question: {
                quizId: args.quizId,
              },
            },
          },
          include: {
            Options: {
              select: {
                isAnswer: true,
                questionId: true,
                Question: {
                  select: {
                    question: true,
                    questionType: true,
                    negativePoints: true,
                    points: true,
                  },
                },
              },
            },
          },
        });

        let fitb = fitbsubmissions.map((item) => {
          return {
            userId: item?.teamId?.toString(),
            qtype: item?.Options?.Question?.questionType,
            question: item?.Options?.Question?.question,
            qid: item?.Options?.questionId,
            mcqans: null,
            isright: item?.isRight,
            fitbans: item?.value,
            laAns: null,
            laIsRight: null,
          };
        });

        quizSubmissions.push(...fitb);

        const lasubmissions = await ctx.prisma.lASubmission.findMany({
          where: {
            teamId: Number(args.teamId),
            Question: {
              quizId: args.quizId,
            },
          },
          include: {
            Question: {
              select: {
                negativePoints: true,
                questionType: true,
                question: true,
              },
            },
          },
        });

        let la = lasubmissions.map((item) => {
          return {
            userId: item?.teamId?.toString(),
            qtype: item?.Question?.questionType,
            question: item?.Question?.question,
            qid: item?.questionId,
            mcqans: null,
            isright: null,
            fitbans: null,
            laAns: item?.value,
            laIsRight: item?.isRight?.toString(),
          };
        });

        quizSubmissions.push(...la);

        quizSubmissions.sort((a, b) => Number(a.userId) - Number(b.userId));

        return quizSubmissions;
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
  })
);
