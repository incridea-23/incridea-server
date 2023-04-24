import { builder } from "../../builder";
import "./mutation";
import "./query";

builder.prismaObject("Submission",{
    fields: (t) => ({
        userId:t.exposeID("userId"),
        cardId:t.exposeID("cardId"),
        image:t.exposeString("image"),
        card:t.relation("Card"),
        user:t.relation("User")
    })
})