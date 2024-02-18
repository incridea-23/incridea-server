import { builder } from "../../builder";
import { context } from "../../context";
import { QuizTimer } from "../../services/auth.service";

export class QuizTimerClass {
  started: boolean;
  remainingTime: number;
  status: string;

  constructor(started: boolean, remainingTime: number, status: string) {
    this.started = started;
    this.remainingTime = remainingTime;
    this.status = status;
  }
}

export const QuizTimerObj = builder.objectType(QuizTimerClass, {
  name: "QuizTimerObj",
  fields: (t) => ({
    started: t.exposeBoolean("started"),
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
      console.log("Subscribed to getTimer");
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
