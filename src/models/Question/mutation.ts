import { QuestionType } from "@prisma/client";
import { builder } from "../../builder";

builder.mutationField("createQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      quizId: t.arg({ type: "String", required: true }),
      question: t.arg({ type: "String", required: true }),
      points: t.arg({ type: "Int", required: true }),
      negativePoint: t.arg({ type: "Int", required: true }),
      questionType: t.arg({ type: "String", required: true }),
      image: t.arg({ type: "String", required: false }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER") {
        throw new Error("Not allowed to perform this action");
      }

      // Create question without  options
      const createdQuestion = await ctx.prisma.question.create({
        data: {
          Quiz: {
            connect: {
              id: args.quizId,
            },
          },
          question: args.question,
          points: args.points,
          negativePoints: args.negativePoint,
          questionType: args.questionType as QuestionType,
          image: args.image,
        },
        ...query,
      });

      return createdQuestion;
    },
  })
);

/// update ///

builder.mutationField("updateQuestion", (t) =>
  t.prismaField({
    //Allowing the organizer to edit the required field in the Question Model
    type: "Question",
    args: {
      id: t.arg({ type: "String", required: true }),
      question: t.arg({ type: "String", required: false }),
      points: t.arg({ type: "Int", required: false }),
      negativePoint: t.arg({ type: "Int", required: false }),
      questionType: t.arg({ type: "String", required: false }),
      image: t.arg({ type: "String", required: false }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      // Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER") {
        throw new Error("Not allowed to perform this action");
      }

      // Prepare the data for updating the question
      const updateData: any = {};
      if (args.question) updateData.question = args.question;
      if (args.points) updateData.points = args.points;
      if (args.negativePoint) updateData.negativePoint = args.negativePoint;
      if (args.questionType) updateData.questionType = args.questionType;
      if (args.image) updateData.image = args.image;

      // Updating  the question based on the provided fields from the organizer
      const updatedQuestion = await ctx.prisma.question.update({
        where: {
          id: args.id,
        },
        data: {
          question: args.question ? args.question : undefined,
          points: args.points ? args.points : undefined,
          negativePoints: args.negativePoint ? args.negativePoint : undefined,
          questionType: args.questionType as QuestionType,
          image: args.image,
          ...query,
        },
      });

      return updatedQuestion;
    },
  })
);

/// Delete ///

builder.mutationField("deleteQuestion", (t) =>
  t.prismaField({
    type: "Question",
    args: {
      id: t.arg({ type: "String", required: true }),
    },
    errors: {
      types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
      // Get user from context
      const user = await ctx.user;
      if (!user) {
        throw new Error("Not authenticated");
      }

      if (user.role !== "ORGANIZER") {
        throw new Error("Not allowed to perform this action");
      }

      // Deleting the question based on the specific question id
      const deletedQuestion = await ctx.prisma.question.delete({
        where: {
          id: args.id,
        },
        ...query,
      });

      return deletedQuestion;
    },
  })
);
