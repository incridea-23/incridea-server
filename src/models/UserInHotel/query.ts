import checkIfAccommodationMember from "../../accommodationMembers/checkIfAccommodationMembers";
import { builder } from "../../builder";


//Accommodation requests for Hotels
builder.queryField("accommodationRequests", (t) =>
    t.prismaField({
        type: ["UserInHotel"],
        resolve: async (query, root, args, ctx, info) => {
        const user = await ctx.user;
        if (!user) throw new Error("Not authenticated");
        if (!checkIfAccommodationMember(user.id))
            throw new Error("Not authorized");
        return ctx.prisma.userInHotel.findMany({
            ...query,
        });
        },
    })
    );

    //Accommodation requests by user 
    builder.queryField("accommodationRequestsByUser", (t) =>
    t.prismaField({
        type: ["UserInHotel"],
        resolve: async (query, root, args, ctx, info) => {
        const user = await ctx.user;
        if (!user) throw new Error("Not authenticated");
        return ctx.prisma.userInHotel.findMany({
            where:{
                userId:user.id
            },
            ...query,
        });
        },
    })
    );

    //Accommodation requests by Day
    builder.queryField("accommodationRequestByDay",(t)=>
    t.prismaField({
        type:["UserInHotel"],
        args:{
            date:t.arg({type:"DateTime",required:true})
        },
        resolve: async(query,root,args,ctx,info)=>{
            const user = await ctx.user;
            if(!user) throw new Error("Not authenticated");
            if(!checkIfAccommodationMember(user.id)) throw new Error("Not authorized");
            const date = args.date;
            return ctx.prisma.userInHotel.findMany({
                where:{
                    checkIn:{
                        equals:date
                    }
                },
                ...query
            })
        }
    })
    )

    //Accommodation requests by Hotel
    builder.queryField("accommodationRequestByHotel",(t)=>
    t.prismaField({
        type:["UserInHotel"],
        args:{
            hotelId:t.arg({type:"ID",required:true})
        },
        resolve: async(query,root,args,ctx,info)=>{
            const user = await ctx.user;
            if(!user) throw new Error("Not authenticated");
            if(!checkIfAccommodationMember(user.id)) throw new Error("Not authorized");
            const hotelId = Number(args.hotelId);
            return ctx.prisma.userInHotel.findMany({
                where:{
                    hotelId:hotelId
                },
                ...query
            })
        }
    })
    )


    
    