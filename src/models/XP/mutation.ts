import { builder } from "../../builder";

//add xp to user
builder.mutationField("addXP", (t) =>
    t.prismaField({
        type: "XP",
        args: {
            levelId: t.arg({ type: "ID", required: true }),
        },
        errors: {
            types: [Error],
        },
        resolve: async (query, root, args, ctx, info) => {
            const user = await ctx.user;
            if (!user) {
                throw new Error("Not authenticated");
            }
            //get level point value
            const level = await ctx.prisma.level.findUnique({
                where: {
                    id: Number(args.levelId),
                },
            });
            if (!level) {
                throw new Error("Level not found");
            }
            //check if user already has xp for level if they do dont add xp
            const xp = await ctx.prisma.xP.findUnique({
                where: {
                    userId_levelId: {
                        userId: Number(user.id),
                        levelId: Number(args.levelId),
                    },
                },
            });
            if (xp) {
                throw new Error("User already has xp for this level");
            }
            //create xp
            const data = await ctx.prisma.xP.create({
                data: {
                    userId: Number(user.id),
                    levelId: Number(args.levelId),
                },
                ...query,
            });
            return data;
        },
    })
);