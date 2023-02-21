import { builder } from "../../builder";

builder.queryField("getBranchReps", (t) =>
    t.prismaField({
        type: ["BranchRep"],
        args: {
        branchId: t.arg({
            type: "ID",
            required: true,
        }),
        },
        resolve: (query, root, args, ctx, info) => {
        return ctx.prisma.branchRep.findMany({
            where: {
            branchId: Number(args.branchId),
            },
        });
        },
    })
);