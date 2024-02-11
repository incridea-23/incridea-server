import { error } from "console";
import { builder } from "../../builder";

builder.queryField("getAllquestions", (t) =>
  t.prismaField({
    type: ["Question"],
    args: {
      quizId: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      try {
        const questions = await ctx.prisma.question.findMany({
          where: {
            quizId: args.quizId,
          },
        });

        return questions;
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
  })
);

builder.queryField("getQuestionById", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      questionId: t.arg({
        type: "String",
        required: true,
      }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      try {
        const question = await ctx.prisma.question.findUnique({
          where: {
            id: args.questionId,
          },
        });

        if (question) return question;
        throw new Error("Question not found");
      } catch (error) {
        throw new Error("Something went wrong");
      }
    },
  })
);
