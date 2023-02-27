import { builder } from "../../builder";

builder.mutationField("addWinner", (t) => 
    t.prismaField({
        type: "Winner",
        args: {
            eventId: t.arg.id({ required: true }),
            teamId: t.arg.id({ required: true }),
            position: t.arg.string({ required: true })
        },
        errors: {
            types: [Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            // const user = await ctx.user;
            // if(!user) 
            //     throw new Error("Not Authenticated");

            // if(user.role!=="ORGANIZER")
            //     throw new Error("Not Authorized");
                
            //give query to find if all rounds are completed
            const event = await ctx.prisma.event.findMany({
                where: {
                    id: Number(args.eventId)
                },
                include: {
                    Organizers: true,
                    Rounds: true
                }
            });
            console.log(event);

            return ctx.prisma.winner.create({
                data: {
                    eventId: Number(args.eventId),
                    teamId: Number(args.teamId),
                    position: "FIRST"
                }
            })
        }
    })
)
