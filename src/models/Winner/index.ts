import { builder } from "../../builder";

builder.prismaObject("Winner", {
    fields: (t) => ({
        eventId: t.exposeID("eventId"),
        teamId: t.exposeID("teamId"),
        positon: t.exposeString("position")
    })
});
