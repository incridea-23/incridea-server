import { builder } from "../../builder";

builder.prismaObject("User", {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    message: t.relation("messages"),
  }),
});
