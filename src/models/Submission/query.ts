import { builder } from "../../builder";

builder.queryField("getAllSubmissions",(t) =>
    t.prismaField({
        type: ["Submission"],
        errors: {
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            //TODO: check if some pids can access
            return ctx.prisma.submission.findMany({});
        }
    }) 
);

builder.queryField("submissionsByUser",(t) => 
    t.prismaField({
        type: ["Submission"],
        errors: {
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            const submissions = await ctx.prisma.submission.findMany({
                where:{
                    userId:user.id
                }
            })
            return submissions;
        }
    })
)