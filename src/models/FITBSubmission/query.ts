import { builder } from "../../builder";

builder.queryField("getFITBSubmissionByTeamId", (t)=>
    t.prismaField({
        type:'FITBSubmission',
        args: {
            questionId: t.arg({
              type: "String",
              required: true,
            }),
            teamId: t.arg({
                type:"String",
                required:true
            })
          },
          errors: {
            types: [Error],
          },
          resolve: async (query, root, args, ctx, info) => {
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

            const fitbSubmission = await ctx.prisma.fITBSubmission.findFirst({
                where:{
                    teamId: Number(args.teamId),
                   Options:{
                    questionId:args.questionId
                   }
                }
            })

            if(!fitbSubmission){
                throw new Error("No submissions by user")
            }

            return fitbSubmission
          }
    })
)