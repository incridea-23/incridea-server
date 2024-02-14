import { builder } from "../../builder";
import { context } from "../../context";
import { QuizTimer } from "../../services/auth.service";

class QuizTimerClass {
  started: boolean;
  remainingTime: number;
  status: string;

  constructor(started: boolean, remainingTime: number, status: string) {
    this.started = started;
    this.remainingTime = remainingTime;
    this.status = status;
  }
}

const QuizTimerObj = builder.objectType(QuizTimerClass, {
  name: "QuizTimerObj",
  fields: (t) => ({
    quizId: t.exposeBoolean("started"),
    remainingTime: t.exposeInt("remainingTime"),
  }),
});

builder.queryField("getTimer", (t) =>
  t.field({
    type: QuizTimerObj,
    args: {
      eventId: t.arg({ type: "Int", required: true }),
    },
    nullable: true,
    errors: {
      types: [Error],
    },
    smartSubscription: true,
    subscribe: (subscriptions, parent, args, info) => {
      subscriptions.register(`QUIZ_TIME_UPDATE/${args.eventId}`);
    },
    resolve: async (root, args, ctx, info) => {
      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          eventId: args.eventId,
        },
      });
      const data = quiz ? QuizTimer.get(quiz?.id) : null;
      if (data)
        return new QuizTimerClass(data?.started, data?.remainingTime, "Ok");
      return new QuizTimerClass(false, -1, "Error");
    },
  })
);

builder.queryField("addTime", (t) =>
  t.field({
    type: QuizTimerObj,
    args: {
      eventId: t.arg({ type: "Int", required: true }),
      incrementValue: t.arg({ type: "Int", required: true }),
    },
    nullable: true,
    errors: {
      types: [Error],
    },
    smartSubscription: true,
    subscribe: (subscriptions, parent, args, info) => {
      subscriptions.register(`QUIZ_TIME_UPDATE/${args.eventId}`);
    },
    resolve: async (root, args, ctx, info) => {
      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          eventId: args.eventId,
        },
      });
      const data = quiz ? QuizTimer.get(quiz?.id) : null;
      if (data && quiz) {
        QuizTimer.set(quiz?.id, {
          eventId: args.eventId,
          started: true,
          remainingTime: data.remainingTime + args.incrementValue,
        });
        return new QuizTimerClass(data?.started, data?.remainingTime, "Ok");
      }
      return new QuizTimerClass(false, -1, "Error");
    },
  })
);

builder.queryField("pauseOrResumeQuiz", (t) =>
  t.field({
    type: QuizTimerObj,
    args: {
      eventId: t.arg({ type: "Int", required: true }),
      action: t.arg({ type: "String", required: true }),
    },
    nullable: true,
    errors: {
      types: [Error],
    },
    smartSubscription: true,
    subscribe: (subscriptions, parent, args, info) => {
      subscriptions.register(`QUIZ_TIME_UPDATE/${args.eventId}`);
    },
    resolve: async (root, args, ctx, info) => {
      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          eventId: args.eventId,
        },
      });
      const data = quiz ? QuizTimer.get(quiz?.id) : null;
      if (data && quiz) {
        if (args.action === "pause")
          QuizTimer.set(quiz?.id, {
            eventId: data.eventId,
            started: false,
            remainingTime: data.remainingTime,
          });
        else if (args.action === "resume")
          QuizTimer.set(quiz?.id, {
            eventId: data.eventId,
            started: true,
            remainingTime: data.remainingTime,
          });
        return new QuizTimerClass(data?.started, data?.remainingTime, "Ok");
      }
      return new QuizTimerClass(false, -1, "Error");
    },
  })
);
