import { builder } from "../../builder";

enum Position {
    FIRST="FIRST",
    SECOND="SECOND",
    THIRD="THIRD"
  }

const PositionType = builder.enumType(Position, {
    name: "PositionType",
  });

builder.mutationField("addWinner", (t) => 
    t.prismaField({
        type: "Winner",
        args: {
            eventId: t.arg.id({ required: true }),
            teamId: t.arg.id({ required: true }),
            position: t.arg({type: PositionType, required: true })
        },
        errors: {
            types: [Error]
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if(!user) 
                throw new Error("Not Authenticated");

            if(user.role!=="ORGANIZER")
                throw new Error("Not Authorized");
                
            const event = await ctx.prisma.event.findUniqueOrThrow({
                where: {
                    id: Number(args.eventId)
                },
                include: {
                    Organizers: true,
                    Rounds: true
                }
            });

            if(!event.Organizers.some(organizer => organizer.userId === user.id))
                throw new Error("Not Authorized");

            const team = await ctx.prisma.team.findUniqueOrThrow({
                where: {
                    id: Number(args.teamId)
                },
                include: {
                    Event: true
                }
            });

            if(team.Event.id !== event.id)
                throw new Error("No Team with this id");

            return ctx.prisma.winner.create({
                data: {
                    eventId: Number(args.eventId),
                    teamId: Number(args.teamId),
                    position: args.position,
                }
            })
        }
    })
)
