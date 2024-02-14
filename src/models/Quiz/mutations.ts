import { builder } from "../../builder";
import { PubSub } from 'graphql-subscriptions';

builder.mutationField("createQuiz", (t) =>
  t.prismaField({
    type: "Quiz",
    args: {
      name: t.arg({ type: "String", required: true }),
      description: t.arg({ type: "String", required: true }),
      roundId: t.arg({ type: "String", required: true }),
      eventId: t.arg({ type: "String", required: true }),
      startTime: t.arg({ type: "DateTime", required: true }),
      endTime: t.arg({ type: "DateTime", required: true }),
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

      if (user.role !== "ORGANIZER") {
        throw new Error("Not allowed to perform this action");
      }

      // Calculating duration from the StartTime and EndTime given by Organizer
      const startTimestamp = new Date(args.startTime).getTime();
      const endTimestamp = new Date(args.endTime).getTime();
      const duration = endTimestamp - startTimestamp;

      if (duration <= 0) {
        throw new Error("Invalid quiz duration");
      }

      const pubsub = new PubSub();
      // Calling the timer function
      startTimerForQuiz(args.quizId, duration, pubsub);

      // Create accommodation request
      const data = await ctx.prisma.quiz.create({
        data: {
          name: args.name,
          description: args.description,
          startTime: new Date(args.startTime),
          endTime: new Date(args.endTime),
          Round: {
            connect: {
              eventId_roundNo: {
                eventId: Number(args.eventId),
                roundNo: Number(args.roundId)
              }
            }
          }
        },
        ...query,
      });
      return data;
    },
  }),
);

function formatTime(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


function startTimerForQuiz(quizId: string, duration: number, pubsub: PubSub) {
  let remainingDuration = duration;

  
  const intervalId = setInterval(() => {
    pubsub.publish(`QUIZ_TIMER_${quizId}`, { quizTimerTick: { timeRemaining: formatTime(remainingDuration) } });
    remainingDuration--;

    // If we have remaining duration is 0(means completed)
    if (remainingDuration < 0) {
      clearInterval(intervalId);
       // Informing the participants  the end of the quiz remaining time as 0:00
       pubsub.publish(`QUIZ_TIMER_${quizId}`, { quizTimerTick: { timeRemaining: '0:00' } });
      console.log(`Quiz ${quizId} ended`);
    }
  }, 1000);
  setTimeout(() => {
    clearInterval(intervalId); 
    console.log(`Quiz ${quizId} ended`);
  }, duration * 1000); 
}


//update the Quiz
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

      if (user.role !== "ORGANIZER") throw new Error("Not allowed to perform this action");

      //create accommodation request
      const data = await ctx.prisma.quiz.update({
        where:{
            id:args.quizId
        },
        data: {
            allowAttempts:args.allowAttempts,
            password:args.password
        },
        ...query,
      });
      return data;
    },
  }),
);