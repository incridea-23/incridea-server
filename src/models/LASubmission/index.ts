import { builder } from "../../builder";


builder.prismaObject("LASubmission",{
    fields:(t)=>({
        id: t.exposeID("id"),
        teamId: t.exposeID("teamId"),
        team: t.relation("Team"),
        questionId: t.exposeID("questionId"),
        Question: t.relation("Question") ,
        value: t.expose("value",{
            type:"String",
            nullable:false
        }),
        isRight: t.exposeString("isRight"),
        createdAt: t.expose("createdAt",{
            type:"DateTime"
        }), 
        updatedAt: t.expose("updatedAt",{
            type:"DateTime"
        }), 

    })
})
