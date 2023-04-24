import { builder } from "../../builder";

builder.queryField("getCards",(t) => 
    t.prismaField({
        type: ["Card"],
        errors:{
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            //TODO: check if authorized people access
            return ctx.prisma.card.findMany({})
        }
    })
)