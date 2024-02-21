import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { builder } from "../../builder";
import { pubsub } from "../../pubsub";
import { QuizTimer } from "../../services/auth.service";
import { secrets } from "../../utils/auth/jwt";
import { QuizTimerClass, QuizTimerObj } from "./subscription";
builder.mutationField("createQuiz", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      name: t.arg({ type: "String", required: true }),
      description: t.arg({ type: "String", required: true }),
      roundId: t.arg({ type: "String", required: true }),
      eventId: t.arg({ type: "String", required: true }),
      startTime: t.arg({ type: "String", required: true }),
      password: t.arg({ type: "String", required: true }),
      endTime: t.arg({ type: "String", required: true }),
      duration: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      //Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.quiz.create({
        data: {
          name: args.name,
          description: args.description,
          startTime: new Date(args.startTime),
          endTime: new Date(args.endTime),
          password: args.password,
          duration: args.duration,
          Round: {
            connect: {
              eventId_roundNo: {
                eventId: Number(args.eventId),
                roundNo: Number(args.roundId),
              },
            },
          },
        },
        ...query,
      });
      await ctx.prisma.judge.create({
        data: {
          Round: {
            connect: {
              eventId_roundNo: {
                eventId: data.eventId,
                roundNo: data.roundId,
              },
            },
          },
          User: {
            create: {
              name: "quiz_" + data.id,
              email: "quiz_" + data.id + "@incridea.in",
              password: bcrypt.hashSync("quiz" + randomInt(100), 12),
            },
          },
        },
      });
      await ctx.prisma.criteria.create({
        data: {
          Round: {
            connect: {
              eventId_roundNo: {
                roundNo: Number(args.roundId),
                eventId: Number(args.eventId),
              },
            },
          },
          name: "QuizScore",
          type: "NUMBER",
        },
      });
      return data;
    },
  })
);

builder.mutationField("updateQuizStatus", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      allowAttempts: t.arg({ type: "Boolean", required: true }),
      password: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      //Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.quiz.update({
        where: {
          id: args.quizId,
        },
        data: {
          allowAttempts: args.allowAttempts,
          password: args.password ? args.password : undefined,
        },
        ...query,
      });
      if (args.allowAttempts) {
        QuizTimer.set(args.quizId, {
          remainingTime: Number(data.duration),
          started: true,
          eventId: data.eventId,
        });
      } else {
        QuizTimer.delete(args.quizId);
      }
      return data;
    },
  })
);

//delete the quiz
builder.mutationField("deleteQuiz", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      //Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      const data = await ctx.prisma.quiz.delete({
        where: {
          id: args.quizId,
        },
        ...query,
      });
      return data;
    },
  })
);

builder.mutationField("submitQuiz", (t) =>
  t.prismaField({
    type: "QuizSubmissions",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      teamId: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      const data = await ctx.prisma.quizSubmissions.create({
          data: {
            Quiz: {
              connect: { 
                id: args.quizId 
              }
            },
            Team: {
              connect: {
                id: Number(args.teamId) 
              }
            },
          }, 
        });
      return data;
    },
  }),
);

builder.mutationField("updateQuizDuration", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      duration: t.arg({ type: "Int", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      //Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER")
        throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.quiz.update({
        where: {
          id: args.quizId,
        },
        data: {
          duration: args.duration,
        },
        ...query,
      });
      return data;
    },
  })
);

builder.mutationField("addTime", (t) =>
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
    resolve: async (root, args, ctx, info) => {
      const quiz = await ctx.prisma.quiz.findFirst({
        where: {
          eventId: args.eventId,
        },
      });
      const data = quiz ? QuizTimer.get(quiz?.id) : null;
      if (data && quiz) {
        if (QuizTimer.get(quiz.id))
          QuizTimer.set(quiz?.id, {
            eventId: args.eventId,
            started: true,
            remainingTime: data.remainingTime + args.incrementValue,
          });
        else {
          console.log("Quiz not ongoing");
          return new QuizTimerClass(false, -1, "Error");
        }
        return new QuizTimerClass(data?.started, data?.remainingTime, "Ok");
      }
      return new QuizTimerClass(false, -1, "Error");
    },
  })
);

builder.mutationField("pauseOrResumeQuiz", (t) =>
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
        pubsub.publish(
          `QUIZ_TIME_UPDATE/${args.eventId}`,
          QuizTimer.get(quiz?.id)
        );
        return new QuizTimerClass(data?.started, data?.remainingTime, "Ok");
      }
      return new QuizTimerClass(false, -1, "Error");
    },
  })
);
