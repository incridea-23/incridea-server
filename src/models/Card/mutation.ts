import { builder } from "../../builder";
import { DayType } from "@prisma/client";

const DayTypeEnum = builder.enumType(DayType, {
  name: "DayType",
});

builder.mutationField("createCard",(t) => 
    t.prismaField({
        type:"Card",
        args:{
            clue: t.arg.string({required:true}),
            day: t.arg({ type:DayTypeEnum,required:true })
        },
        errors:{
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            //TODO: check if authorized people access
            return ctx.prisma.card.create({
                data:{
                    clue: args.clue,
                    day: args.day
                }
            })
        }
    })
);

builder.mutationField("updateCard",(t)=>
    t.prismaField({
        type:"Card",
        args:{
            id: t.arg.id({required:true}),
            clue: t.arg.string({required:true}),
            day: t.arg({ type:DayTypeEnum,required:true })
        },
        errors:{
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            //TODO: check if authorized people access
            const card = await ctx.prisma.card.findUnique({
                where:{
                    id: Number(args.id),
                }
            });
            if(!card)
                throw new Error("No such card");
            return ctx.prisma.card.update({
                where:{
                    id: Number(args.id),
                },
                data:{
                    clue: args.clue,
                    day: args.day
                }
            })
        }
    })
);

builder.mutationField("deleteCard",(t) => 
    t.prismaField({
        type: "Card",
        args: {
            id: t.arg.id({required:true})
        },
        errors:{
            types:[Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = ctx.user;
            if(!user)
                throw new Error("Not authenticated");
            //TODO: check if authorized people access
            const card = await ctx.prisma.card.findUnique({
                where:{
                    id: Number(args.id),
                }
            });
            if(!card)
                throw new Error("No such card");
            return ctx.prisma.card.delete({
                where:{
                    id: Number(args.id),
                }
            })
        }
    })
);