import { builder } from "../../builder";


builder.prismaObject("Quiz",{
    fields: (t)=>({
        id: t.exposeID("id"),
        roundNo: t.exposeInt("roundId"),
        eventId: t.exposeID("eventId"),
        name: t.expose("name",{
            type:"String",
            nullable: false
        }),
        description: t.expose("description",{
            type:"String",
            nullable: true
        }),
        round:t.relation("Round"),
        questions: t.relation("Questions")
    })
})
