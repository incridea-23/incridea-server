import {builder} from "../../builder";


//Get all Hotels
builder.queryField("getAllHotels",(t)=>t.prismaField({
    type: ["Hotel"],
    resolve: (query, root, args, ctx, info) => {
        return ctx.prisma.hotel.findMany({
            ...query
        });
    }
}))

