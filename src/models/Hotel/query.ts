import {builder} from "../../builder";


//Get all Hotels
builder.queryField("getAllHotels",(t)=>t.prismaField({
    type: ["Hotel"],
   
    resolve: async(query, root, args, ctx, info) => {
        return await ctx.prisma.hotel.findMany({
            ...query
        });
    }
}))

