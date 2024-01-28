import { builder } from "../../builder";


builder.mutationField("createQuestions",(t)=>
t.prismaField({
    type:"Question",
    args:{
      question:t.arg({
         type:"String",
         required:true,
      }) ,
        points:t.arg({
         type:"Int",
         required:false,
      }),
         negativePoints: t.arg({
             type: "Int",
             required: false,
        }),
        image: t.arg({
            type:"String",
            required:false,
        })
    },
    errors:{
        types:[Error],
    },
    resolve: async (query, root, args, ctx, info) => {
        const user = await ctx.user;
        // if (user?.role != "ORGANIZER") throw new Error("No Permission");
        // if (user?.role != "BRANCH_REP") throw new Error("No Permission");
        return ctx.prisma.question.create({
            data: {

                question: args.question,
                points:args.points,
                negativePoints: args.negativePoints,
                image: args.image ,

            },
        });
    },
})
)