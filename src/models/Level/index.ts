import { builder } from "../../builder";
import "./query";
import "./mutation";

builder.prismaObject("Level", {
    fields: (t) => ({
        id: t.exposeID("id"),
        point: t.exposeInt("point"),
        xp: t.relation("XP"),
    }),
});