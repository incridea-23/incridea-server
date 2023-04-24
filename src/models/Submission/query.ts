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
                throw new Error("Not authenicated");
            //TODO: check if some pids can access
            return ctx.prisma.submission.findMany({});
        }
    }) 
)