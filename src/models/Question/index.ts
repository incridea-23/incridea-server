import { builder } from "../../builder";


builder.prismaObject("Question",{
    fields:(t)=>({
        id: t.exposeID("id"),
        quizId: t.exposeID("quizId"),
        quiz: t.relation("Quiz"),
        question: t.expose("question",{
            type:"String",
            nullable:false
        }),
        point: t.exposeInt("points"),
        negativePoint: t.exposeInt("negativePoints"),
        image: t.expose("image",{
            type:"String",
            nullable:true
        })

    })
})


