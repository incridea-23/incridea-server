import { builder } from "../../builder";
import "./mutation";


builder.prismaObject("Question", {
    fields: (t) => ({
        id: t.exposeID("id"),
        quizId: t.exposeID("quizId"),
        quiz: t.relation("Quiz"),
        question: t.expose("question", {
            type: "String",
            nullable: false
        }),
        points: t.exposeInt("points"),
        negativePoints: t.exposeInt("negativePoints"),
        image: t.expose("image", {
            type: "String",
            nullable: true
        })

    })
})

