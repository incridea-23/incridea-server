import { builder } from "../../builder";
import "./query";
import "./mutation";

builder.prismaObject("XP", {
    fields: (t) => ({
        id: t.exposeID("id"),
        user: t.relation("User"),
        level: t.relation("Level"),
    }),
});