import { builder } from "../../builder";

builder.queryField("judgesByEvent", (t) =>
    t.prismaField({
        type: ["Judge"],
        args: {
            eventId: t.arg({type:"ID", required: true }),
            roundNo: t.arg.int({ required: true }),
        },  
        resolve: (query, root, args, ctx, info) => {
            return ctx.prisma.judge.findMany({
                where: {
                    eventId: Number(args.eventId),
                    roundNo: Number(args.roundNo),
                },
                ...query,
            });
        }
    })
);