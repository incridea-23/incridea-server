import { builder } from "../../builder";
import checkIfPublicityMember from "../../publicityMembers/checkIfPublicityMember";

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
            if(!checkIfPublicityMember(user.id))
                throw new Error("Not authorized");
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