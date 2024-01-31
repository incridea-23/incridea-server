import { builder } from "../../builder";

builder.mutationField("createOption", (t) =>
  t.prismaField({
    type: "Options",
    args: {
      questionId: t.arg({ type: "String", required: true }),
      value: t.arg({ type: "String", required: true }),
      isAnswer: t.arg({ type: "Boolean", required: true }),
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

      // Create the option for the question

        const createdOption = await ctx.prisma.options.create({
          data: {
            questionId: args.questionId,
            value: args.value,
            isAnswer: args.isAnswer,
          },
          ...query,
        });

        return createdOption;
      
    },
  })
);

//update the option

builder.mutationField("updateOption", (t) =>
  t.prismaField({
    type: "Options",
    args: {
      id: t.arg({ type: "String", required: true }),
      value: t.arg({ type: "String", required: false }), 
      isAnswer: t.arg({ type: "Boolean", required: false }), 
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

    

      const updateData: any = {};
      if (args.value) updateData.value = args.value;
      if (args.isAnswer) updateData.isAnswer = args.isAnswer;

      const updatedOption = await ctx.prisma.options.update({
        where: {
          id: args.id,
        },
        data: updateData,
        ...query,
      });

      return updatedOption;
    },
  })
);

//Delete the Option
builder.mutationField("deleteOption", (t) =>
  t.prismaField({
    type: "Options",
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
      const deleteOption= await ctx.prisma.options.delete({
        where: {
          id: args.id,
        },
        ...query,
      });

      return deleteOption;
    },
  }),
);


