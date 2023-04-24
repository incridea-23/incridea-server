import { builder } from "../../builder";
import checkIfPublicityMember from "../../publicityMembers/checkIfPublicityMember";
import { DayType } from "@prisma/client";

builder.queryField("getCards",(t) => 
    t.prismaField({
        type: ["Card"],
        args:{
            day: t.arg({ type:DayType,required:true })
        },
        errors:{
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            if(!checkIfPublicityMember(user.id))
                throw new Error("Not authorized");
            return ctx.prisma.card.findMany({
                where:{
                    day: args.day
                }
            });
        }
    })
)