import checkIfAccommodationMember from "../../accommodationMembers/checkIfAccommodationMembers";
import { builder } from "../../builder";


//Accommodation requests for Hotels
builder.queryField("accommodationRequests", (t) =>
    t.prismaField({
        type: ["UserInHotel"],
        errors: {
            types: [Error],
          },
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

    builder.queryField("accommodationRequestsByUserId",(t)=>
        t.prismaField({
            type:["UserInHotel"],
            args:{
                userId:t.arg({type:"ID",required:true})
            },
            resolve: async(query,root,args,ctx,info)=>{
                const user = await ctx.user;
                if(!user) throw new Error("Not authenticated");
                if(!checkIfAccommodationMember(user.id)) throw new Error("Not authorized");
                const userId = Number(args.userId);
                return ctx.prisma.userInHotel.findMany({
                    where:{
                        userId:userId
                    },
                    ...query
                })
            }
        })
    )


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
            name:t.arg({type:"String",required:true})
        },
        resolve: async(query,root,args,ctx,info)=>{
            const user = await ctx.user;
            if(!user) throw new Error("Not authenticated");
            if(!checkIfAccommodationMember(user.id)) throw new Error("Not authorized");
            const hotelName = args.name;
            return ctx.prisma.userInHotel.findMany({
                where:{
                    Hotel:{
                        OR:[{
                            name:{
                                contains:hotelName
                            },
                        },
                    {
                        details:{
                            contains:hotelName
                        }
                    }]
                        
                    }
                },
                ...query
            })
        }
    })
    )


    
    