import { DateTime } from "graphql-scalars/typings/mocks";
import { builder } from "../../builder";
import { connect } from "http2";



builder.mutationField("createQuiz",(t)=>
t.prismaField({
    type :"Quiz",
    args:{
    name:t.arg({
            type:"String",
            required: true,
        }),
     description :t.arg({
        type:"String",
        required:false,
     }),
        eventId: t.arg({   //figureout linking related keys
            type: "Int",
            required: true,
        }),
        roundNo: t.arg({   //figureout linking related keys
            type: "Int",
            required: true,
        }),
        startTime: t.arg({
            type: "DateTime",
            required:false
        }),
        password:t.arg({
            type:"String",
            required:true,
        }),
        endTime: t.arg({
            type: "DateTime",
            required: false
        }),     
               
    },
    errors: {
        types: [Error],
    },
    resolve: async (query, root, args, ctx, info) => {
        const user = await ctx.user;
        if (user?.role != "ORGANIZER") throw new Error("No Permission");
        // if (user?.role != "BRANCH_REP") throw new Error("No Permission");
        return ctx.prisma.quiz.create({
            data: {
             
                     name: args.name,
                     description: args.description,
                     // roundNo: args.roundNo,
                     startTime: args.startTime as Date,
                     endTime: args.endTime as Date,
                     password: args.password,
                     roundId:Number(args.roundNo),
                     eventId: Number(args.eventId), 
                
                    
            },
        });
    },
})

);


builder.mutationField("getQuiz",(t)=>
t.prismaField({
    type:"Quiz",
    args:{
        eventId: t.arg({  
            type: "Int",
            required: false,
        }),
        name: t.arg({
            type: "String",
            required: true,
        }),
  },
    errors: {
        types: [Error],
    },
    resolve: async(query, root, args, ctx, info)=>{
        const user = await ctx.user;
        if (user?.role != "ORGANIZER") throw new Error("No Permission");

        const result= await  ctx.prisma.quiz.findFirst({
            where:{
                name: args.name,
            }
        });
        return result;
    }

}))


// builder.mutationField("editQuiz", (t) =>
//     t.prismaField({
//         type: "Quiz",
//         args: {
//             name: t.arg({
//                 type: "String",
//                 required: false,
//             }),
//             description: t.arg({
//                 type: "String",
//                 required: false,
//             }),
//             eventId: t.arg({   //figureout linking related keys
//                 type: "Int",
//                 required: false,
//             }),
//             roundNo: t.arg({   //figureout linking related keys
//                 type: "Int",
//                 required: false,
//             }),
//             startTime: t.arg({
//                 type: "DateTime",
//                 required: false
//             }),
//             password: t.arg({
//                 type: "String",
//                 required: false,
//             }),
//             endTime: t.arg({
//                 type: "DateTime",
//                 required: false
//             }),

//         },
//         errors: {
//             types: [Error],
//         },
//         resolve: async (query, root, args, ctx, info) => {
//             const user = await ctx.user;
//             if (user?.role != "ORGANIZER") throw new Error("No Permission");
//             // if (user?.role != "BRANCH_REP") throw new Error("No Permission");
//             return ctx.prisma.quiz.update({
//                 data: {

//                 },
//             });
//         },
//     })

