import { builder } from "../../builder";

builder.queryField("hotel", (t) =>
    t.prismaField({
        type: ["Hotel"],
        resolve: (query, root, args, ctx, info) => {
        return ctx.prisma.hotel.findMany({}
        ...query,
            );
        },
    })
    );
