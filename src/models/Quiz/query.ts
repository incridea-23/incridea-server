import { builder } from "../../builder";

class Option {
  id: string;
  answer: string;

  constructor(id: string, answer: string) {
    this.id = id;
    this.answer = answer;
  }
}
class CheckPassword {
  status: boolean;

  constructor(status: boolean) {
    this.status = status;
  }
}

builder.objectType(Option, {
  name: "Option",
  fields: (t) => ({
    id: t.exposeString("id"),
    answer: t.exposeString("answer"),
  }),
});

class AllSubmissions {
  userId: string;
  qType: string;
  question: string;
  qId: string;
  options: Option[] | null;
  mcqAns: string | null;
  isRight: boolean | null;
  fitbAns: string | null;
  laAns: string | null;
  longAnsIsRight: string | null;

  constructor(
    options: {
      id: string;
      answer: string;
    }[],
    mcqAns: string | null,
    isRight: boolean | null,
    fitbAns: string | null,
    laAns: string | null,
    longAnsIsRight: string | null,
    userId: string,
    qType: string,
    question: string,
    qId: string
  ) {
    this.options = options;
    this.mcqAns = mcqAns;
    this.isRight = isRight;
    this.fitbAns = fitbAns;
    this.laAns = laAns;
    this.longAnsIsRight = longAnsIsRight;
    this.userId = userId;
    this.qType = qType;
    this.question = question;
    this.qId = qId;
  }
}

const AllSubmissionsType = builder.objectType(AllSubmissions, {
  name: "AllSubmissions",
  fields: (t) => ({
    options: t.expose("options", { nullable: true, type: [Option] }),
    mcqAns: t.exposeString("mcqAns", { nullable: true }),
    isRight: t.exposeBoolean("isRight", { nullable: true }),
    fitbAns: t.exposeString("fitbAns", { nullable: true }),
    laAns: t.exposeString("laAns", { nullable: true }),
    longAnsIsRight: t.exposeString("longAnsIsRight", { nullable: true }),
    userId: t.exposeString("userId"),
    qType: t.exposeString("qType"),
    question: t.exposeString("question"),
    qId: t.exposeString("qId"),
  }),
});

builder.queryField("getAllQuizSubmissions", (t) =>
  t.field({
    type: [AllSubmissionsType],
    args: {
      quizId: t.arg({
        type: "String",
        required: true,
      }),
      eventId: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
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

      let quizSubmissions: {
        options: Option[] | null;
        userId: string;
        qType: string;
        question: string;
        qId: string;
        mcqAns: string | null;
        isRight: boolean | null;
        fitbAns: string | null;
        laAns: string | null;
        longAnsIsRight: string | null;
      }[] = [];

      const mcqSubmissions = await ctx.prisma.mCQSubmission.findMany({
        where: {
          Options: {
            Question: {
              quizId: args.quizId,
            },
          },
        },
        include: {
          Options: {
            include: {
              Question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      let mcq = mcqSubmissions.map((item) => {
        let optionsArr = item?.Options?.Question?.options?.map((item) => {
          return {
            id: item?.id,
            answer: item?.value,
          };
        });

        {
        }
        [];

        return {
          options: optionsArr,
          userId: item?.teamId?.toString(),
          qType: item?.Options?.Question?.questionType.toString(),
          question: item?.Options?.Question?.question,
          qId: item?.Options?.questionId,
          mcqAns: item?.Options?.value,
          isRight: item?.Options?.isAnswer,
          fitbAns: null,
          laAns: null,
          longAnsIsRight: null,
        };
      });
      console.log(mcq[0].options);
      quizSubmissions.push(...mcq);

      const fitbSubmissions = await ctx.prisma.fITBSubmission.findMany({
        where: {
          Options: {
            Question: {
              quizId: args.quizId,
            },
          },
        },
        include: {
          Options: {
            include: {
              Question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      let fitb = fitbSubmissions.map((item) => {
        return {
          options: null,
          userId: item?.teamId?.toString(),
          qType: item?.Options?.Question?.questionType.toString(),
          question: item?.Options?.Question?.question,
          qId: item?.Options?.questionId,
          mcqAns: null,
          isRight: item?.isRight,
          fitbAns: item?.value,
          laAns: null,
          longAnsIsRight: null,
        };
      });

      quizSubmissions.push(...fitb);

      const laSubmissions = await ctx.prisma.lASubmission.findMany({
        where: {
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

      let la = laSubmissions.map((item) => {
        return {
          options: null,
          userId: item?.teamId?.toString(),
          qType: item?.Question?.questionType,
          question: item?.Question?.question,
          qId: item?.questionId,
          mcqAns: null,
          isRight: null,
          fitbAns: null,
          laAns: item?.value,
          longAnsIsRight: item?.isRight?.toString(),
        };
      });

      quizSubmissions.push(...la);

      quizSubmissions.sort((a, b) => Number(a.userId) - Number(b.userId));

      return quizSubmissions;
    },
  })
);

builder.queryField("getQuizDataByEventRound", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      eventId: t.arg({
        type: "Int",
        required: true,
      }),
      roundId: t.arg({
        type: "Int",
        required: true,
      }),
      type: t.arg({
        type: "String",
        required: true,
      }),
      password: t.arg({
        type: "String",
        required: true,
      }),
      teamId: t.arg({
        type: "Int",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      // if (user.role !== "ORGANIZER") {
      //   throw new Error("Not authorized");
      // }
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
      if (
        args.type === "organizer" &&
        !event.Organizers.find((o) => o.userId === user.id)
      ) {
        throw new Error("Not authorized");
      }

      if (args.type === "participant") {
        const team = await ctx.prisma.team.findFirst({
          where: {
            Event: {
              Rounds: {
                some: {
                  Quiz: {
                    eventId: Number(args.eventId),
                    roundId: Number(args.roundId),
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

        if (team?.id !== args.teamId) {
          throw new Error("Not authorized");
        }
      }

      const data = await ctx.prisma.quiz.findUnique({
        where: {
          eventId_roundId: {
            eventId: Number(args.eventId),
            roundId: Number(args.roundId),
          },
        },
        ...query,
      });

      if (!data) {
        throw new Error("There is no quiz in this event");
      }

      if (args.type === "participant" && data.password !== args.password) {
        throw new Error("Invalid password");
      }

      if (!data.allowAttempts && args.type === "participant") throw new Error("Attempts not allowed");

      return data;
    },
  })
);

builder.queryField("getQuizByRoundEvent", (t) =>
  t.prismaField({
    type: ["Quiz"],
    args: {
      eventId: t.arg({
        type: "Int",
        required: true,
      }),
      roundNo: t.arg({
        type: "Int",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }
      // if (user.role !== "ORGANIZER") {
      //   throw new Error("Not authorized");
      // }
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
      // if (!event.Organizers.find((o) => o.userId === user.id)) {
      //   throw new Error("Not authorized");
      // }

      const data = await ctx.prisma.quiz.findUnique({
        where: {
          eventId_roundId: {
            eventId: Number(args.eventId),
            roundId: Number(args.roundNo),
          },
        },
        ...query,
      });
      console.log(data);
      if (!data) {
        throw new Error("There is no quiz in this event");
      }
      return [data];
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
      let quizSubmissions: {
        options: Option[] | null;
        userId: string;
        qType: string;
        question: string;
        qId: string;
        mcqAns: string | null;
        isRight: boolean | null;
        fitbAns: string | null;
        laAns: string | null;
        longAnsIsRight: string | null;
      }[] = [];

      const user = await ctx.user;
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

      const mcqSubmissions = await ctx.prisma.mCQSubmission.findMany({
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
            include: {
              Question: {
                include: {
                  options: true,
                },
              },
            },
          },
        },
      });

      let mcq = mcqSubmissions.map((item) => {
        let optionsArr = item?.Options?.Question?.options?.map((item) => {
          return {
            id: item?.id,
            answer: item?.value,
          };
        });

        {
        }
        [];

        return {
          options: optionsArr,
          userId: item?.teamId?.toString(),
          qType: item?.Options?.Question?.questionType.toString(),
          question: item?.Options?.Question?.question,
          qId: item?.Options?.questionId,
          mcqAns: item?.Options?.value,
          isRight: item?.Options?.isAnswer,
          fitbAns: null,
          laAns: null,
          longAnsIsRight: null,
        };
      });
      console.log(mcq[0].options);
      quizSubmissions.push(...mcq);

      const fitbSubmissions = await ctx.prisma.fITBSubmission.findMany({
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

      let fitb = fitbSubmissions.map((item) => {
        return {
          options: null,
          userId: item?.teamId?.toString(),
          qType: item?.Options?.Question?.questionType,
          question: item?.Options?.Question?.question,
          qId: item?.Options?.questionId,
          mcqAns: null,
          isRight: item?.isRight,
          fitbAns: item?.value,
          laAns: null,
          longAnsIsRight: null,
        };
      });

      quizSubmissions.push(...fitb);

      const laSubmissions = await ctx.prisma.lASubmission.findMany({
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

      let la = laSubmissions.map((item) => {
        return {
          options: null,
          userId: item?.teamId?.toString(),
          qType: item?.Question?.questionType,
          question: item?.Question?.question,
          qId: item?.questionId,
          mcqAns: null,
          isRight: null,
          fitbAns: null,
          laAns: item?.value,
          longAnsIsRight: item?.isRight?.toString(),
        };
      });

      quizSubmissions.push(...la);

      quizSubmissions.sort((a, b) => Number(a.userId) - Number(b.userId));

      return quizSubmissions;
    },
  })
);

const CheckPasswordObj = builder.objectType(CheckPassword, {
  name: "CheckPassword",
  fields: (t) => ({
    status: t.exposeBoolean("status"),
  }),
});

builder.queryField("checkPassword", (t) =>
  t.field({
    type: CheckPasswordObj,
    args: {
      eventId: t.arg({
        type: "Int",
        required: true,
      }),
      roundId: t.arg({
        type: "Int",
        required: true,
      }),
      password: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (root, args, ctx, info) => {
      const quiz = await ctx.prisma.quiz.findUnique({
        where: {
          eventId_roundId: {
            eventId: Number(args.eventId),
            roundId: Number(args.roundId),
          },
        },
      });
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      return new CheckPassword(quiz.password === args.password);
    },
  })
);
