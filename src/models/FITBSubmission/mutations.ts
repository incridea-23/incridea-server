import { builder } from "../../builder";

builder.mutationField("createFTIBSubmission",(t)=>
    t.prismaField({
        type:"FITBSubmission",
        args: {
            teamId: t.arg({
                type: "String",
                required: true,
              }),
              questionId: t.arg({
                type:"String",
                required:true
              }),
              value:t.arg({
                type:"String",
                required:true
              })
        },
        errors:{
            types: [Error],
        },
        resolve:async(query, root, args, ctx, info)=>{
            const user= await ctx.user;
            if(user?.role !== "PARTICIPANT"){
                throw new Error("No permission")
            }

            const team = await ctx.prisma.team.findFirst({
                where:{
                    id: Number(args.teamId),
                    Event:{
                        Rounds:{
                            every:{
                                Quiz:{
                                    Questions:{
                                       every:{
                                        id:args.questionId
                                       } 
                                    }
                                }
                            }
                        }
                    }

                }
            })


            if(!team){
                throw new Error("No permission")
            }

            const options = await ctx.prisma.options.findFirst({
                where:{
                    questionId:args.questionId
                }
            })
            if(!options){
                throw new Error("option does not exist")
            }

            const fitbSubmissionExists = await ctx.prisma.fITBSubmission.findFirst({
                where:{
                    teamId: Number(args.teamId),
                    optionId: options.id
                }
            })

            if(fitbSubmissionExists){
                throw new Error("Already submitted")
            }

            return await ctx.prisma.fITBSubmission.create({
                data:{
                    teamId:Number(args.teamId),
                    value:args.value,
                    optionId: options.id
                }
            })
        }
    })
)



builder.mutationField("updateFTIBSubmission",(t)=>
    t.prismaField({
        type:"FITBSubmission",
        args: {
            teamId: t.arg({
                type: "String",
                required: true,
              }),
              questionId: t.arg({
                type:"String",
                required:true
              }),
              value:t.arg({
                type:"String",
                required:true
              }),
              fitbSubmissionId:t.arg({
                type:"String",
                required:true
              })
        },
        errors:{
            types: [Error],
        },
        resolve:async(query, root, args, ctx, info)=>{
            const user= await ctx.user;
            if(user?.role !== "PARTICIPANT"){
                throw new Error("No permission")
            }

            const team = await ctx.prisma.team.findFirst({
                where:{
                    id: Number(args.teamId),
                    Event:{
                        Rounds:{
                            every:{
                                Quiz:{
                                    Questions:{
                                       every:{
                                        id:args.questionId
                                       } 
                                    }
                                }
                            }
                        }
                    }

                }
            })


            if(!team){
                throw new Error("No permission")
            }

            const options = await ctx.prisma.options.findFirst({
                where:{
                    questionId:args.questionId
                }
            })
            if(!options){
                throw new Error("option does not exist")
            }

            

            return await ctx.prisma.fITBSubmission.update({
                where:{
                    id:args.fitbSubmissionId
                },
                data:{       
                    value:args.value,
                }
            })
        }
    })
) 