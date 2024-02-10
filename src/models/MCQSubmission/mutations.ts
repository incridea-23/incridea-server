import { builder } from "../../builder";

builder.mutationField("createMCQSubmission",(t)=>
    t.prismaField({
        type:"MCQSubmission",
        args: {
            teamId: t.arg({
                type: "String",
                required: true,
              }),
              questionId: t.arg({
                type:"String",
                required:true
              }),
              optionId:t.arg({
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
            const mcqSubmissionExists = await ctx.prisma.mCQSubmission.findFirst({
                where:{
                    teamId: Number(args.teamId),
                    optionId: args.optionId
                }
            })

            if(mcqSubmissionExists){
                throw new Error("Already submitted")
            }

            return await ctx.prisma.mCQSubmission.create({
                data:{
                    teamId:Number(args.teamId),
                    optionId: args.optionId
                }
            })
        }
    })
)


builder.mutationField("updateMCQSubmission",(t)=>
    t.prismaField({
        type:"MCQSubmission",
        args: {
            teamId: t.arg({
                type: "String",
                required: true,
              }),
              questionId: t.arg({
                type:"String",
                required:true
              }),
              mcqSubmissionId: t.arg({
                type:"String",
                required:true
              }),
              optionId:t.arg({
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

            return await ctx.prisma.mCQSubmission.update({
                where:{
                    id:args.mcqSubmissionId,
                },
                data:{ 
                    optionId: args.optionId
                }
            })
        }
    })
)
