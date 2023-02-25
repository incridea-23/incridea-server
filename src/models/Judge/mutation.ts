import { builder } from "../../builder";

builder.mutationField("addJudge", (t) => 
    t.prismaField({
        type: "Judge",
        args:{
            userID: t.arg({
                type: "ID",
                required: true
            }),
            eventID: t.arg({
                type: "ID",
                required: true
            }),
            roundNo: t.arg({
                type: "Int",
                required: true
            })
        },
        errors: {
          types: [Error],
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if (!user) throw new Error("Not authenticated");
            if (user.role !== "ORGANIZER") 
                throw new Error("Not authorized");
            
            const event = await ctx.prisma.event.findUnique({
                    where: {
                            id: Number(args.eventID)
                        }
                    });
            if (!event) throw new Error("No event exists");

            const judge = await ctx.prisma.judge.findUnique({
                where: {
                    userId_eventId_roundNo: {
                        userId: Number(args.userID),
                        eventId: Number(args.eventID),
                        roundNo: Number(args.roundNo)
                    }
                }
            });
            if (judge) throw new Error("Judge already exists");

            return ctx.prisma.judge.create({
                data: {
                    userId: Number(args.userID),
                    eventId: Number(args.eventID),
                    roundNo: Number(args.roundNo)
                }
            });
    }
}));