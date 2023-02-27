import { builder } from "../../builder";
import "./mutation"

builder.prismaObject("Winner", {
    fields: (t) => ({
        eventId: t.exposeID("eventId"),
        teamId: t.exposeID("teamId"),
        positon: t.exposeString("position")
    })
});
