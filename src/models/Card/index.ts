import { builder } from "../../builder";

builder.prismaObject("Card",{
    fields: (t) => ({
        id:t.exposeID("id"),
        clue:t.exposeString("clue"),
        day:t.exposeString("day")
    })
})